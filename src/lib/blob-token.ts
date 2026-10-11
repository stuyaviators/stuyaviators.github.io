/**
The Vercel Blob token. Connecting the store to the project with a prefix
("aviatorsblob") names it aviatorsblob_READ_WRITE_TOKEN instead of
BLOB_READ_WRITE_TOKEN; either works.
*/
export function blobToken(): string | undefined {
	const token =
		process.env.BLOB_READ_WRITE_TOKEN ??
		process.env.aviatorsblob_READ_WRITE_TOKEN;
	return token === undefined || token.trim() === "" ? undefined : token;
}
