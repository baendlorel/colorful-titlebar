const test = async () => {
  try {
    if (Math.random() > 0.5) {
      throw new Error('Random error occurred');
    }
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        reject('promise error');
      }, 2000);
    });
  } catch (error) {
    console.log(error);
  }
};
test();
