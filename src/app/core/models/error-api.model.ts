/** Error ya traducido a un mensaje legible para el usuario por el interceptor de errores. */
export class ErrorApi extends Error {
  constructor(
    mensaje: string,
    readonly codigo: number,
  ) {
    super(mensaje);
    this.name = 'ErrorApi';
  }
}
