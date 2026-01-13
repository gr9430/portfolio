from random import choice, shuffle
article = ['the', 'a', 'an']
noun = ['lawn', 'bed', 'guy', 'boat', 'shoe', 'mouth', 'teeth', 'beacon', 'light', 'group', 'bottom', 'feeders', 'heathens', 'person', 'world', 'ops', 'foothold', 'bladder', 'life', 'miracle', 'workers', 'bullshit', 'disposition', 'tantrums']
verb = ['keep', 'tidy', 'heard', 'swear', 'seen', 'throw', 'spit', 'stick', 'cracking', 'comes', 'can', 'see', 'churn', 'help', 'mow', 'hope', 'feel']
adjective = ['amazing', 'little', 'imperfect', 'warm', 'sunny', 'greatest', 'divided', 'pre', 'post', 'tidy']
adverb = ['never', 'right', 'through', 'alive']
pronoun = ['I', 'my', 'myself', 'you', 'your', 'yourself']
preposition = ['in', 'of', 'with', 'between', 'down', 'amongst', 'like', 'on', 'to', 'through']
conjunction = ['and', 'cause', 'because', 'when']
interjections = []
articles = ['a', 'the']
auxiliary = ['be', 'is', 'are', 'will', 'have', 'can']
particles = ["'s"]
punctuation = ['!', '.', ',', '?']

print_lines = [
    f"{choice(pronoun)} {choice(verb)} {choice(adjective)} {choice(noun)}{choice(punctuation)}",
    f"{choice(auxiliary)} {choice(pronoun)} {choice(verb)} {choice(preposition)} {choice(noun)}{choice(punctuation)}",
    f"{choice(pronoun)} {choice(verb)} {choice(preposition)} {choice(adjective)} {choice(noun)}{choice(punctuation)}",
    f"{choice(pronoun)} {choice(verb)} {choice(noun)} {choice(preposition)} {choice(adjective)} {choice(noun)}{choice(punctuation)}",
    f"{choice(pronoun)} {choice(verb)} {choice(preposition)} {choice(noun)}{choice(punctuation)}"
]

shuffle(print_lines)

for line in print_lines:
    print(line)