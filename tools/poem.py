from random import choice, shuffle
article = ['the', 'a', 'an']
material = ['candy corn', 'crumbling stone', 'spider webs', 'pumpkins']
location = ['in a haunted forest', 'at the end of a foresaken path', 'by an abandoned lake']
light_source = ['one thousand candles', 'lightning', 'moonlight']
inhabitants = ['cats', 'bats', 'friendly ghosts']

print_lines = [
    f"{choice(article)} house of {choice(material)}",
    f"      {choice(location)}",
    f"          using {choice(light_source)}",
    f"                  inhabited by {choice(inhabitants)}"
]

shuffle(print_lines)

for line in print_lines:
    print(line)