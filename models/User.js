/** @format */
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Por favor, ingrese un nombre."],
    minLength: 3,
    maxLength: 20,
    trim: true,
  },
  lastName: {
    type: String,
    maxLength: 20,
    trim: true,
    default: "Apellido",
  },
  email: {
    type: String,
    validate: {
      validator: validator.isEmail,
      message: "Por favor, ingrese un email válido",
    },
    required: [true, "Por favor, ingrese un email."],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Por favor, ingrese una contraseña."],
    minLength: 6,
    select: false, //significa que no es un campo que vayamos a obtener en una consulta por usuario simple.
  },
  location: {
    type: String,
    default: "Mi Ciudad",
    maxLength: 20,
    trim: true,
  },
});

UserSchema.pre("save", async function () {
  // console.log(this.modifiedPaths());
  // console.log(this.isModified("name"));
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
  //userId es un alias para el identificador _id que viene como respuesta ante la carga de un nuevo usuario en la BD. Ver respuesta a cada post en POSTMAN.
  // return jwt.sign({ userId: this._id }, "jwtSecret", { expiresIn: "1d" });
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

export default mongoose.model("User", UserSchema);
