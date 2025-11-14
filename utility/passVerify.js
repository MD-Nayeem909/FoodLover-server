import bcrypt from 'bcrypt';

function passwordHash(password) {
	const salt = bcrypt.genSaltSync(10);
	const hash = bcrypt.hashSync(password, salt);
	return hash;
}

function passwordVerify(password, hash) {
	return bcrypt.compareSync(password, hash);
}

export { passwordHash, passwordVerify };
