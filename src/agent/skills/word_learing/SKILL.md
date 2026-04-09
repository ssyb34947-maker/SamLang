---

name:  word_learning
description: Explain and teach an English word using meaning, word roots, and memory techniques when a user asks what a word means or how to remember it.
tools:

- dictionary
- websearch

---

# Word Learning Skill

## Use this skill when

The user asks about an **English word for learning purposes**, such as:

- meaning of a word
- how to remember a word
- word roots / etymology
- examples of a word

Examples:

- "What does extract mean?"
- "How do I remember transport?"
- "Explain the word predict"

Do NOT use this skill if the user only wants **translation** or asks a **grammar question**.

***

# Tool Strategy

1. Use **dictionary** to get:
   - definition
   - pronunciation
   - part of speech
2. If root or etymology is unclear, use **websearch**.
3. Break the word into:

prefix + root + suffix

1. Explain the meaning using **root-based memory logic**.

Example:

extract\
ex = out\
tract = pull

→ pull out → extract

***

# Answer

1. Save and answer all url links in your answer in markdown format,let it can.

