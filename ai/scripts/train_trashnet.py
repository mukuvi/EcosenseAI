from __future__ import annotations

import argparse
import json
from pathlib import Path

import tensorflow as tf
from tensorflow.keras import layers


def build_model(num_classes: int, image_size: tuple[int, int]) -> tf.keras.Model:
    base = tf.keras.applications.MobileNetV2(
        input_shape=(*image_size, 3),
        include_top=False,
        weights="imagenet",
    )
    base.trainable = False

    inputs = layers.Input(shape=(*image_size, 3))
    x = layers.Rescaling(1.0 / 127.5, offset=-1.0)(inputs)
    x = base(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = tf.keras.Model(inputs, outputs)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", required=True)
    parser.add_argument("--out", default="models/waste_classifier.keras")
    parser.add_argument("--epochs", type=int, default=6)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--image-size", type=int, default=224)
    args = parser.parse_args()

    image_size = (args.image_size, args.image_size)
    data_dir = Path(args.data_dir)
    out_path = Path(args.out)

    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="training",
        seed=1337,
        image_size=image_size,
        batch_size=args.batch_size,
        label_mode="categorical",
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="validation",
        seed=1337,
        image_size=image_size,
        batch_size=args.batch_size,
        label_mode="categorical",
        class_names=train_ds.class_names,
    )

    class_names = list(train_ds.class_names)
    print("classes", class_names)

    augmentation = tf.keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.08),
        layers.RandomZoom(0.1),
    ])

    train_ds = train_ds.map(lambda x, y: (augmentation(x, training=True), y)).prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.prefetch(tf.data.AUTOTUNE)

    model = build_model(len(class_names), image_size)
    model.summary()

    callbacks = [
        tf.keras.callbacks.EarlyStopping(patience=2, restore_best_weights=True),
        tf.keras.callbacks.ModelCheckpoint(str(out_path), save_best_only=True),
    ]

    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs,
        callbacks=callbacks,
    )

    model = tf.keras.models.load_model(out_path)
    loss, accuracy = model.evaluate(val_ds)
    print("validation_loss", round(float(loss), 4))
    print("validation_accuracy", round(float(accuracy), 4))

    labels_path = out_path.parent / "waste_classifier_labels.json"
    labels_path.write_text(json.dumps(class_names, indent=2))

    meta_path = out_path.parent / "waste_classifier_meta.json"
    meta_path.write_text(json.dumps({"input_scale": 255.0, "image_size": list(image_size)}, indent=2))

    print("saved", out_path)
    print("labels", labels_path)
    print("meta", meta_path)
    print("history", {key: [round(float(v), 4) for v in values] for key, values in history.history.items()})
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
