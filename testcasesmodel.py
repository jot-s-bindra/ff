import pathlib
import textwrap
import sys
import google.generativeai as genai

from IPython.display import Markdown

file = "test.py"
with open(file, 'r') as file_content:
    code = file_content.read()

test_cases = 3


def to_markdown(text):
    text = text.replace('•', '  *')
    return Markdown(textwrap.indent(text, '> ', predicate=lambda _: True))


GOOGLE_API_KEY = 'AIzaSyCdPE9kPLsSor92CR_XDJSSBfigrLQGwuQ'

genai.configure(api_key=GOOGLE_API_KEY)

model = genai.GenerativeModel('gemini-pro')
response = model.generate_content(
    "State {} possible test cases pointwise in plain English for the following code:\n\n{}".format(test_cases, code))
ans = (response.text)
print(ans)

response = model.generate_content(
    "Generate only code without explanation. Create {} test functions for the provided code using unit tests and importing necessary functions/classes/modules. Assume the code is in a file named '{}' and import the code from '{}'.\n\n```\n{}\n``` You can take help from this {}. Also, provide the main run function at the end for running unittests.".format(
        test_cases, file, file, code, ans))
print(response.text)

test_cases_file_path = pathlib.Path(file).resolve().parent / "test_cases.py"
python_file_path = pathlib.Path(file).resolve().parent / "test.py"

with open(test_cases_file_path, "w") as f:
    f.write(response.text)

with open(test_cases_file_path, 'r') as file:
    lines = file.readlines()

modified_content = lines[1:-1]

with open(test_cases_file_path, 'w') as file:
    file.writelines(modified_content)
##use this for generate
output = "no error"
prompt = "Given the test code {}, which includes the following test cases: {}, you've encountered errors in the output. Please provide only the corrected test cases code (nothing else) with unit tests. The output of the original test cases is:\n\n```\n{}\n```\nEnsure that the corrected test cases address any errors observed.".format(
    code, modified_content, output)
response = model.generate_content(prompt)
response.text

with open(test_cases_file_path, "w") as f:
    f.write(response.text)

with open(test_cases_file_path, 'r') as file:
    lines = file.readlines()

modified_content = lines[1:-1]

with open(test_cases_file_path, 'w') as file:
    file.writelines(modified_content)





