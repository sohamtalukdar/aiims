import sys
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import Layer
from tensorflow.keras import backend as K
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.initializers import glorot_uniform
from tensorflow.keras.saving import register_keras_serializable
import json
from collections import Counter

@register_keras_serializable(package="Custom", name="Attention")
class Attention(Layer):
    def __init__(self, **kwargs):
        super(Attention, self).__init__(**kwargs)

    def build(self, input_shape):
        self.W = self.add_weight(name='attention_weight', shape=(input_shape[-1], input_shape[-1]),
                                 initializer=glorot_uniform(), trainable=True)
        self.b = self.add_weight(name='attention_bias', shape=(input_shape[-1],),
                                 initializer='zeros', trainable=True)
        super(Attention, self).build(input_shape)

    def call(self, x):
        e = K.tanh(K.dot(x, self.W) + self.b)
        a = K.softmax(e, axis=1)
        output = K.sum(x * a, axis=1)
        return output

def process_file(csv_file, model_path, class_labels_path):
    df = pd.read_csv(csv_file)

    for col in df.columns:
        df[col] = df[col].apply(lambda x: np.array(eval(x)))
        scaler = StandardScaler()
        df[col] = list(scaler.fit_transform(list(df[col])))

    X = np.array(df.values.tolist())

    model = load_model(model_path, custom_objects={"Attention": Attention})
    predictions = model.predict(X)

    predicted_classes = np.argmax(predictions, axis=1)
    dominant_class = Counter(predicted_classes).most_common(1)[0][0]

    with open(class_labels_path, 'r') as f:
        class_labels = json.load(f)

    dominant_class_label = class_labels[str(dominant_class)]
    return dominant_class_label

def main():
    # sys.argv: csv_file, model_path, class_labels_path
    csv_file = sys.argv[1]
    model_path = sys.argv[2]
    class_labels_path = sys.argv[3]

    dominant_class_label = process_file(csv_file, model_path, class_labels_path)
    print(dominant_class_label)

if __name__ == "__main__":
    main()

