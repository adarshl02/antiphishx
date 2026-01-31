export const generateId = (prefix) => {
    const randomNumbers = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}${randomNumbers}`;
  };
  