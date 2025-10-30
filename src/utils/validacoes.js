// utils/validacoes.js
export const validarEmail = (email) => {
  // Regex simples e eficaz para validar emails
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
