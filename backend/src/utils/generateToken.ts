import jwt from 'jsonwebtoken';

const generateToken = (id: string, role: string, expiresIn: jwt.SignOptions['expiresIn'] = '30d') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
    expiresIn,
  });
};

export default generateToken;
