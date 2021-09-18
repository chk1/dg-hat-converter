# Duck Game .hat file decryptor

## Python implementation

Requires Python 3 and the `pycryptodome` library. Insert hat file name into `hat-convert.py` and then run it.

```
pip install pycryptodome
python hat-convert.py
```

## Web / JavaScript implementation

The web version uses modern browser's FileReader and crypto APIs to decode .hat files into PNG images. ZIP download is offered with the [JSZip library](https://stuk.github.io/jszip/).

Live version at https://chk1.github.io/dg-hat-converter/

## License

Code licensed under the MIT license

jszip.min.zip (c) 2009-2016 Stuart Knightley, dual licensed under MIT license or GPLv3
