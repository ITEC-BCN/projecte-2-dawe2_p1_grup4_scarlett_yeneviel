import jwt from "jsonwebtoken";
import { SECRET_JWT_KEY } from "../../config.js";

export async function generarTokenRestauracion(email) {
  const token = await jwt.sign({ email: email }, SECRET_JWT_KEY, {
    expiresIn: "1h",
  });

  return token;
}
