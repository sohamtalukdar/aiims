import tensorflow as tf
from tensorflow.keras.models import load_model

# Define the Attention layer
class Attention(tf.keras.layers.Layer):
    def __init__(self, **kwargs):
        super(Attention, self).__init__(**kwargs)

    def build(self, input_shape):
        self.W = self.add_weight(
            name="attention_weight",
            shape=(input_shape[-1], input_shape[-1]),
            initializer="glorot_uniform",
            trainable=True,
        )
        self.b = self.add_weight(
            name="attention_bias",
            shape=(input_shape[-1],),
            initializer="zeros",
            trainable=True,
        )
        super(Attention, self).build(input_shape)

    def call(self, x):
        e = tf.nn.tanh(tf.tensordot(x, self.W, axes=1) + self.b)
        a = tf.nn.softmax(e, axis=1)
        output = tf.reduce_sum(x * tf.expand_dims(a, axis=-1), axis=1)
        return output

# Try loading the model and provide debugging info
try:
    model = tf.keras.models.load_model(
        "/home/soham/aiims/my-app/aiims_acoustic_24-oct-24_model1_model.keras",
        custom_objects={"Attention": Attention}
    )
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Save the model if it was loaded successfully
if model:
    try:
        model.save("./resaved_model.keras")
        print("Model resaved successfully.")
    except Exception as e:
        print(f"Error saving model: {e}")
