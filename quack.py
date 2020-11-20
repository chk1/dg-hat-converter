import base64
import os
import sys
# pip install pycryptodome
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

# put file name here
input_filename = "BigHeadWhite.hat"
output_filename_base = os.path.splitext(input_filename)[0]

# https://github.com/penguinscode/Quackhead/blob/master/quackhead.js#L14
key_encoded = "8xaYIAH0em9hKg0CEw8t5g=="
key = base64.b64decode(key_encoded)

if not os.path.isfile(input_filename):
	print(input_filename, "file was not found, please change the filename in the Python file")
	sys.exit()

def decryptHat(hat):
	iv_len = int.from_bytes(hat[:4], byteorder='little')
	iv = bytes(hat[4:4+iv_len])
	cipher = AES.new(key, AES.MODE_CBC, iv=iv)
	hat_stream = hat[20:]
	plaintext = cipher.decrypt(hat_stream)
	return plaintext

def parseMetadata(hat):
	magic_number = int.from_bytes(hat[0:8], byteorder='little')
	hat_name_len = int.from_bytes(hat[8:9], byteorder='little')
	hat_name = hat[9:9+hat_name_len].decode()
	offset = 9+hat_name_len
	offset_end = offset+4
	image_size = int.from_bytes(hat[offset:offset_end], byteorder='little')
	
	metadata = "magic: {}\nname: {}\nsize: {}".format(magic_number, hat_name, image_size)

	return metadata, offset_end

with open(input_filename, "rb") as hatfile:
	hat = hatfile.read()
	decrypted = decryptHat(hat)
	metadata, png_offset = parseMetadata(decrypted)
	print(metadata)

	filename_metadata = "{}.txt".format(output_filename_base)
	filename_image = "{}.png".format(output_filename_base)

	if os.path.isfile(filename_metadata):
		print(filename_metadata, "already exists, not overwriting")
	else:
		with open(filename_metadata, "w") as out_metafile:
			out_metafile.write(str(metadata))
			print(filename_metadata, "saved")

	if os.path.isfile(filename_image):
		print(filename_image, "already exists, not overwriting")
	else:	
		with open(filename_image, "wb") as out_hatfile:
			out_hatfile.write(decrypted[png_offset:])
			print(filename_image, "saved")
