class NeuralNetwork {
  constructor(config = {}) {
    const { model, numInputs } = config;

    this.numInputs = numInputs;
    
    if (model) {
      this.model = model;
    } else {
      this.model = NeuralNetwork.createModel(numInputs);
    }
  }

  copy() {
    return tf.tidy(() => {
      const weights = this.model.getWeights();
      const weightCopies = [];
      for (let i = 0; i < weights.length; i++) {
        weightCopies[i] = weights[i].clone();
      }
      const modelCopy = NeuralNetwork.createModel(this.numInputs);
      modelCopy.setWeights(weightCopies);
      return new NeuralNetwork({ model: modelCopy, numInputs: this.numInputs });
    });
  }

  dispose() {
    // this.model.dispose();
  }

  predict(inputs) {
    return tf.tidy(() => {
      const xs = tf.tensor2d([inputs]);
      const ys = this.model.predict(xs);
      const outputs = ys.dataSync();
      return outputs;
    });
  }

  mutate(mutationRate) {
    let hasMutated = false;
    tf.tidy(() => {
      const weights = this.model.getWeights();
      const mutatedWeights = [];
      do {
        for (let i = 0; i < weights.length; i++) {
          let tensor = weights[i];
          let shape = weights[i].shape;
          let values = tensor.dataSync().slice();
          for (let j = 0; j < values.length; j++) {
            if (random(1) < mutationRate) {
              let w = values[j];
              values[j] = randomGaussian(w);
              hasMutated = true;
            }
          }
          let newTensor = tf.tensor(values, shape);
          mutatedWeights[i] = newTensor;
        }
      } while(!hasMutated);
      this.model.setWeights(mutatedWeights);
    });
  }
  
  static createModel(numInputs) {
    const model = tf.sequential();
    model.add(tf.layers.dense({
      units: 32,
      inputShape: [numInputs],
      activation: 'relu'
    }));
    model.add(tf.layers.dense({
      units: 16,
      activation: 'relu'
    }));
    model.add(tf.layers.dense({
      units: 3,
      activation: 'sigmoid'
    }));
    return model;
  }
}