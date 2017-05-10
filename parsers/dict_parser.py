f = open('sources/cedict_ts.u8', 'r')

TONES = {'a': {'1': 'ā', '2': 'á', '3': 'ǎ', '4': 'à', '5': 'a'},
		 'e': {'1': 'ē', '2': 'é', '3': 'ě', '4': 'è', '5': 'e'},
		 'i': {'1': 'ī', '2': 'í', '3': 'ǐ', '4': 'ì', '5': 'i'},
		 'o': {'1': 'ō', '2': 'ó', '3': 'ǒ', '4': 'ò', '5': 'o'},
		 'u': {'1': 'ū', '2': 'ú', '3': 'ǔ', '4': 'ù', '5': 'u', ':2': 'ǘ', ':3': 'ǚ', ':4': 'ǜ'},
		 'A': {'1': 'Ā', '2': 'Á', '3': 'Ǎ', '4': 'À', '5': 'A'},
 		 'E': {'1': 'Ē', '2': 'É', '3': 'Ě', '4': 'È', '5': 'E'},
 		 'O': {'1': 'Ō', '2': 'Ó', '3': 'Ǒ', '4': 'Ò', '5': 'O'},
}
VOWELS = 'aeiouAEO'
def convert_pinyin_word(word):
	if not (word[0].isalpha() and word[-1].isnumeric()):
		return word
	tone = word[-2:] if word[-2] == ':' else word[-1]
	word = word[:-2] if word[-2] == ':' else word[:-1]
	vowels = ''
	for i in range(len(word)):
		if word[i] in VOWELS:
			vowels = word[i:i+2] if i < len(word)-1 and word[i+1] in VOWELS else word[i]
			break
	if len(vowels) == 0:
		return word
	elif len(vowels) == 1:
		return word.replace(vowels, TONES[vowels][tone])
	else:
		priority_vowels = 'aAeEoO'
		for pv in priority_vowels:
			if pv in vowels:
				return word.replace(pv, TONES[pv][tone])
		return word.replace(vowels[1], TONES[vowels[1]][tone])

def convert_pinyin(pinyin):
	result = []
	for word in pinyin.split():
		result.append(convert_pinyin_word(word))
	return ' '.join(result)

d = {}
simplified_to_traditional = {}
traditional_to_simplified = {}
while True:
	line = f.readline()
	if not line:
		break
	if line[0] == '#':
		continue

	# skip traditional chinese
	start = end = 0
	while line[end] != ' ':
		end += 1
	traditional = line[start : end]

	# get simplified chinese
	start = end = end + 1
	while line[end] != ' ':
		end += 1
	simplified = line[start : end]

	# get pinyin
	start = end = end + 2
	while line[end] != ']':
		end += 1
	pinyin = convert_pinyin(line[start : end])

	# get english
	start = end + 2
	english = line[start+1:-2].replace('/', '; ')

	# add to dictionaries
	if len(simplified) == 1 and simplified != traditional:
		simplified_to_traditional[simplified] = traditional
		traditional_to_simplified[traditional] = simplified

	if simplified in d:
		d[simplified]["pinyin"].append(pinyin)
		d[simplified]["english"].append(english)
	else:
		d[simplified] = {"pinyin": [pinyin], "english": [english]}

import json
dict_file = open('json/dict.json', 'w')
s_to_t_file = open('json/simplified-to-traditional.json', 'w')
t_to_s_file = open('json/traditional-to-simplified.json', 'w')
dict_file.write(json.dumps(d, ensure_ascii=False, indent=4, separators=(',', ': ')))
s_to_t_file.write(json.dumps(simplified_to_traditional, ensure_ascii=False, indent=4, separators=(',', ': ')))
t_to_s_file.write(json.dumps(traditional_to_simplified, ensure_ascii=False, indent=4, separators=(',', ': ')))
dict_file.close()
s_to_t_file.close()
t_to_s_file.close()
f.close()
