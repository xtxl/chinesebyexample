filenames = [
	'星星點燈.txt',
	'敢问路在何方.txt',
	'大海.txt',
	'大约在冬季.txt',
	'心爱.txt',
	'月亮代表我的心.txt',
	'演员.txt',
	'潇洒走一回.txt',
	'甜密密.txt',
	'羅小黑戰記(1).txt',
	'彈起我心愛的土琵琶.txt',
	'少林小子.txt'
]

vocab = {}
examples = []
exceptions = {'少年': 'shàonián', '着': 'zhe'}

def is_chinese(char):
	return ord(char) >= 0x4e00 and ord(char) <= 0x9FFF

for filename in filenames:
	f = open('sources/' + filename, 'r')
	source = f.readline()[:-1]
	s_id = f.readline()[:-1]
	s_type = f.readline()[:-1]

	state = 0
	chinese = english = ''
	while True:
		line = f.readline()
		if not line:
			break
		if line == '\n':
			continue
		if line == '#\n':
			if state != 0:
				raise Exception
			state = 2
			continue

		# 0: Chinese line
		if state == 0:
			chinese += line
			state = 1

		# 1: English line
		elif state == 1:
			english += line
			state = 0

		# 2: Time stamps
		elif state == 2:
			t = line.split()
			start, end = t[0], t[1]
			example = {'source': source,
					   'id': s_id,
					   'type': s_type,
					   'start': int(start),
					   'end': int(end),
					   'chinese': chinese,
					   'english': english}
			examples.append(example)
			chinese = english = ''
			state = 3

		# 3: Vocabulary
		elif state == 3:
			visited = set()
			terms = []
			for term in line.split():
				if term in visited:
					continue
				visited.add(term)
				terms.append(term)
				for word in term:
					if word in visited:
						continue
					visited.add(word)
					terms.append(word)
			for term in terms:
				if term not in vocab:
					vocab[term] = {'exampleIndices': []}
				vocab[term]['exampleIndices'].append(len(examples)-1)
			state = 0

frequency_for_word = {}
t = []
for chinese in vocab:
	example_indices = vocab[chinese]['exampleIndices']
	t.append({'chinese': chinese, 'exampleIndices': example_indices})
	frequency_for_word[chinese] = len(example_indices)
vocab = sorted(t, key=lambda v: -len(v['exampleIndices']))

from math import log
def key_for_example(example_index):
	chinese = examples[example_index]['chinese']
	n_words = sum_frequency = 0
	for word in chinese:
		if word in frequency_for_word:
			n_words += 1
			sum_frequency += 1/frequency_for_word[word]**2
	return sum_frequency / n_words * log(n_words, 2)

for chinese in vocab:
	chinese["exampleIndices"].sort(key=key_for_example)

import json
vocab_file = open('json/vocab.json', 'w')
example_file = open('json/examples.json', 'w')
vocab_file.write(json.dumps(vocab, ensure_ascii=False, indent=4, separators=(',', ': ')))
example_file.write(json.dumps(examples, ensure_ascii=False, indent=4, separators=(',', ': ')))
vocab_file.close()
example_file.close()
f.close()
