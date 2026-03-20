/* eslint-disable */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Course = require('../models/Course');

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_recruit';

const n = '\n';

function ch(id, order, title, content) {
    return { chapterId: id, order, title, videoUrl: '', content };
}

const chapters = [
    ch('py_ch_01', 1, 'Introduction to Python',
        '# Welcome to Python Programming' + n + n +
        'Python is one of the most popular and versatile programming languages in the world. Used in web development, data science, AI, scripting, and more.' + n + n +
        '## Why Learn Python?' + n +
        '- **Simple and readable** syntax — reads almost like English' + n +
        '- **Huge community** and endless libraries' + n +
        '- **In-demand skill** in the job market' + n +
        '- Works on all platforms (Windows, Mac, Linux)' + n + n +
        '## Your First Python Program' + n + n +
        'Every programmer starts with "Hello, World!". Run the code below:' + n + n +
        '```python' + n +
        'print("Hello, World!")' + n +
        'print("Welcome to Python Programming!")' + n +
        'print("Lets build something amazing together.")' + n +
        '```' + n + n +
        '## Key Points' + n +
        '- print() is a built-in function used to display output' + n +
        '- Python uses indentation instead of curly braces' + n +
        '- Python files use the .py extension' + n + n +
        '## Python Versions' + n +
        'This course uses **Python 3.x** which is the current standard. Python 2 is no longer maintained.'
    ),

    ch('py_ch_02', 2, 'Variables and Data Types',
        '# Variables and Data Types' + n + n +
        'In Python, a **variable** is a named container that stores a value. You do not need to declare types — Python figures them out automatically.' + n + n +
        '## Basic Data Types' + n +
        '- **int** — Whole numbers (e.g. 42)' + n +
        '- **float** — Decimal numbers (e.g. 3.14)' + n +
        '- **str** — Text/strings (e.g. "hello")' + n +
        '- **bool** — Boolean values (True or False)' + n + n +
        '## Declaring Variables' + n + n +
        '```python' + n +
        'age = 21          # Integer' + n +
        'gpa = 8.5         # Float' + n +
        'name = "Tirth"    # String' + n +
        'is_student = True # Boolean' + n + n +
        'print("Name:", name)' + n +
        'print("Age:", age)' + n +
        'print("GPA:", gpa)' + n +
        'print("Is Student:", is_student)' + n +
        'print(type(name))' + n +
        'print(type(age))' + n +
        '```' + n + n +
        '## Dynamic Typing' + n +
        'Python allows you to reassign variables to different types:' + n + n +
        '```python' + n +
        'x = 10' + n +
        'print("x is:", x, "| Type:", type(x))' + n +
        'x = "now I am a string"' + n +
        'print("x is:", x, "| Type:", type(x))' + n +
        '```'
    ),

    ch('py_ch_03', 3, 'Operators and Expressions',
        '# Operators and Expressions' + n + n +
        'Operators let you perform operations on variables and values.' + n + n +
        '## Arithmetic Operators' + n + n +
        '```python' + n +
        'a = 20' + n +
        'b = 6' + n +
        'print("Addition:", a + b)' + n +
        'print("Subtraction:", a - b)' + n +
        'print("Multiplication:", a * b)' + n +
        'print("Division:", a / b)' + n +
        'print("Floor Division:", a // b)' + n +
        'print("Modulus:", a % b)' + n +
        'print("Exponent:", a ** 2)' + n +
        '```' + n + n +
        '## Comparison Operators' + n + n +
        '```python' + n +
        'x = 10' + n +
        'y = 20' + n +
        'print(x == y)' + n +
        'print(x != y)' + n +
        'print(x > y)' + n +
        'print(x < y)' + n +
        'print(x >= 10)' + n +
        'print(y <= 20)' + n +
        '```' + n + n +
        '## Logical Operators' + n + n +
        '```python' + n +
        'a = True' + n +
        'b = False' + n +
        'print(a and b)' + n +
        'print(a or b)' + n +
        'print(not a)' + n +
        '```' + n + n +
        '## Assignment Operators' + n + n +
        '```python' + n +
        'score = 100' + n +
        'score += 10' + n +
        'print(score)' + n +
        'score -= 5' + n +
        'print(score)' + n +
        'score *= 2' + n +
        'print(score)' + n +
        '```'
    ),

    ch('py_ch_04', 4, 'Strings and String Methods',
        '# Strings and String Methods' + n + n +
        'Strings are sequences of characters enclosed in quotes.' + n + n +
        '## Creating Strings' + n + n +
        '```python' + n +
        'name = "CampusRecruit"' + n +
        'greeting = "Hello, world!"' + n +
        'multiline = """This is line one' + n +
        'This is line two"""' + n +
        'print(name)' + n +
        'print(greeting)' + n +
        'print(multiline)' + n +
        '```' + n + n +
        '## Useful String Methods' + n + n +
        '```python' + n +
        'text = "  Hello, Python World!  "' + n +
        'print(text.upper())' + n +
        'print(text.lower())' + n +
        'print(text.strip())' + n +
        'print(text.replace("Python", "Awesome"))' + n +
        'print(text.split(","))' + n +
        'print(len(text))' + n +
        '```' + n + n +
        '## f-Strings (Formatted Strings)' + n + n +
        '```python' + n +
        'name = "Tirth"' + n +
        'score = 95.5' + n +
        'course = "Python"' + n +
        'message = f"Congrats {name}! You scored {score}% in {course}."' + n +
        'print(message)' + n +
        '```'
    ),

    ch('py_ch_05', 5, 'Conditional Statements (if/elif/else)',
        '# Conditional Statements' + n + n +
        'Python uses **if**, **elif**, and **else** to make decisions in your code.' + n + n +
        '## Basic if / else' + n + n +
        '```python' + n +
        'marks = 72' + n +
        'if marks >= 60:' + n +
        '    print("Pass - Congratulations!")' + n +
        'else:' + n +
        '    print("Fail - Please study harder.")' + n +
        '```' + n + n +
        '## if / elif / else' + n + n +
        '```python' + n +
        'score = 85' + n +
        'if score >= 90:' + n +
        '    grade = "A"' + n +
        'elif score >= 80:' + n +
        '    grade = "B"' + n +
        'elif score >= 70:' + n +
        '    grade = "C"' + n +
        'elif score >= 60:' + n +
        '    grade = "D"' + n +
        'else:' + n +
        '    grade = "F"' + n +
        'print(f"Your grade is: {grade}")' + n +
        '```' + n + n +
        '## Nested Conditions' + n + n +
        '```python' + n +
        'age = 20' + n +
        'has_id = True' + n +
        'if age >= 18:' + n +
        '    if has_id:' + n +
        '        print("Access granted!")' + n +
        '    else:' + n +
        '        print("Please show your ID.")' + n +
        'else:' + n +
        '    print("You must be 18 or older.")' + n +
        '```' + n + n +
        '## Ternary Expression' + n + n +
        '```python' + n +
        'x = 10' + n +
        'result = "Positive" if x > 0 else "Non-positive"' + n +
        'print(result)' + n +
        '```'
    ),

    ch('py_ch_06', 6, 'Loops: for and while',
        '# Loops in Python' + n + n +
        'Loops let you repeat code multiple times without copy-pasting.' + n + n +
        '## The for Loop' + n + n +
        '```python' + n +
        'for i in range(5):' + n +
        '    print(f"Iteration {i}")' + n +
        '```' + n + n +
        '## Looping Through a String' + n + n +
        '```python' + n +
        'word = "Python"' + n +
        'for letter in word:' + n +
        '    print(letter)' + n +
        '```' + n + n +
        '## The while Loop' + n + n +
        '```python' + n +
        'count = 1' + n +
        'while count <= 5:' + n +
        '    print(f"Count: {count}")' + n +
        '    count += 1' + n +
        'print("Done!")' + n +
        '```' + n + n +
        '## break and continue' + n + n +
        '```python' + n +
        'for i in range(10):' + n +
        '    if i == 5:' + n +
        '        print("Breaking at 5!")' + n +
        '        break' + n +
        '    print(i)' + n +
        'print("---")' + n +
        'for i in range(10):' + n +
        '    if i % 2 == 0:' + n +
        '        continue' + n +
        '    print(i)' + n +
        '```' + n + n +
        '## Multiplication Table' + n + n +
        '```python' + n +
        'for i in range(1, 4):' + n +
        '    for j in range(1, 4):' + n +
        '        print(f"{i} x {j} = {i*j}")' + n +
        '    print("---")' + n +
        '```'
    ),

    ch('py_ch_07', 7, 'Lists and List Methods',
        '# Lists in Python' + n + n +
        'A **list** is an ordered, mutable collection of items.' + n + n +
        '## Creating and Accessing Lists' + n + n +
        '```python' + n +
        'fruits = ["apple", "banana", "cherry"]' + n +
        'numbers = [1, 2, 3, 4, 5]' + n +
        'print(fruits)' + n +
        'print(numbers[0])   # First element' + n +
        'print(fruits[-1])   # Last element' + n +
        '```' + n + n +
        '## Modifying Lists' + n + n +
        '```python' + n +
        'colors = ["red", "green", "blue"]' + n +
        'colors.append("yellow")' + n +
        'colors.insert(1, "orange")' + n +
        'colors.remove("green")' + n +
        'popped = colors.pop()' + n +
        'print(colors)' + n +
        'print("Popped:", popped)' + n +
        '```' + n + n +
        '## List Slicing' + n + n +
        '```python' + n +
        'nums = [0, 10, 20, 30, 40, 50]' + n +
        'print(nums[1:4])' + n +
        'print(nums[:3])' + n +
        'print(nums[3:])' + n +
        'print(nums[::2])' + n +
        'print(nums[::-1])' + n +
        '```' + n + n +
        '## List Comprehension' + n + n +
        '```python' + n +
        'squares = [n ** 2 for n in range(1, 6)]' + n +
        'print(squares)' + n +
        'evens = [n for n in range(20) if n % 2 == 0]' + n +
        'print(evens)' + n +
        '```'
    ),

    ch('py_ch_08', 8, 'Tuples, Sets, and Dictionaries',
        '# Tuples, Sets, and Dictionaries' + n + n +
        'Python offers several powerful built-in data structures.' + n + n +
        '## Tuples (Immutable)' + n + n +
        '```python' + n +
        'point = (10, 20)' + n +
        'print(point[0])' + n +
        'x, y = point' + n +
        'print(f"X={x}, Y={y}")' + n +
        '```' + n + n +
        '## Sets (Unique values only)' + n + n +
        '```python' + n +
        'fruits = {"apple", "banana", "cherry", "apple"}' + n +
        'print(fruits)  # Duplicates removed' + n +
        'a = {1, 2, 3, 4}' + n +
        'b = {3, 4, 5, 6}' + n +
        'print(a | b)  # Union' + n +
        'print(a & b)  # Intersection' + n +
        'print(a - b)  # Difference' + n +
        '```' + n + n +
        '## Dictionaries (Key-Value pairs)' + n + n +
        '```python' + n +
        'student = {' + n +
        '    "name": "Tirth",' + n +
        '    "age": 21,' + n +
        '    "gpa": 8.5,' + n +
        '    "courses": ["Python", "Math", "DSA"]' + n +
        '}' + n +
        'print(student["name"])' + n +
        'student["age"] = 22' + n +
        'for key, value in student.items():' + n +
        '    print(f"{key}: {value}")' + n +
        '```'
    ),

    ch('py_ch_09', 9, 'Functions',
        '# Functions in Python' + n + n +
        'Functions are reusable blocks of code that perform a specific task.' + n + n +
        '## Defining and Calling a Function' + n + n +
        '```python' + n +
        'def greet():' + n +
        '    print("Hello! Welcome to Python.")' + n + n +
        'greet()' + n +
        'greet()' + n +
        '```' + n + n +
        '## Functions with Parameters and Return' + n + n +
        '```python' + n +
        'def add(a, b):' + n +
        '    return a + b' + n + n +
        'result = add(10, 20)' + n +
        'print("Sum:", result)' + n +
        '```' + n + n +
        '## Default Parameters' + n + n +
        '```python' + n +
        'def introduce(name, age=18, city="Unknown"):' + n +
        '    print(f"I am {name}, {age} years old from {city}.")' + n + n +
        'introduce("Tirth", 21, "Ahmedabad")' + n +
        'introduce("Priya")' + n +
        '```' + n + n +
        '## *args and **kwargs' + n + n +
        '```python' + n +
        'def total(*numbers):' + n +
        '    return sum(numbers)' + n + n +
        'print(total(1, 2, 3))' + n +
        'print(total(5, 10, 15, 20))' + n + n +
        'def profile(**details):' + n +
        '    for key, val in details.items():' + n +
        '        print(f"{key}: {val}")' + n + n +
        'profile(name="Tirth", gpa=8.5, city="Surat")' + n +
        '```'
    ),

    ch('py_ch_10', 10, 'Lambda Functions and Higher-Order Functions',
        '# Lambda Functions and Higher-Order Functions' + n + n +
        'Lambda functions are small anonymous one-line functions.' + n + n +
        '## Lambda Functions' + n + n +
        '```python' + n +
        'square = lambda x: x ** 2' + n +
        'print(square(5))' + n +
        'print(square(9))' + n +
        '```' + n + n +
        '## map() — Apply to all items' + n + n +
        '```python' + n +
        'numbers = [1, 2, 3, 4, 5]' + n +
        'squares = list(map(lambda x: x ** 2, numbers))' + n +
        'print(squares)' + n +
        'words = ["hello", "world", "python"]' + n +
        'upper = list(map(str.upper, words))' + n +
        'print(upper)' + n +
        '```' + n + n +
        '## filter() — Keep passing items' + n + n +
        '```python' + n +
        'numbers = range(1, 21)' + n +
        'evens = list(filter(lambda x: x % 2 == 0, numbers))' + n +
        'print(evens)' + n +
        '```' + n + n +
        '## sorted() with key function' + n + n +
        '```python' + n +
        'students = [' + n +
        '    {"name": "Tirth", "gpa": 8.5},' + n +
        '    {"name": "Priya", "gpa": 9.1},' + n +
        '    {"name": "Raj", "gpa": 7.8},' + n +
        ']' + n +
        'sorted_students = sorted(students, key=lambda s: s["gpa"], reverse=True)' + n +
        'for s in sorted_students:' + n +
        '    print(f"{s[\'name\']}: {s[\'gpa\']}")' + n +
        '```'
    ),

    ch('py_ch_11', 11, 'Object-Oriented Programming — Classes and Objects',
        '# Object-Oriented Programming (OOP)' + n + n +
        'OOP organizes code around **objects** that combine data (attributes) and behavior (methods).' + n + n +
        '## Creating a Class' + n + n +
        '```python' + n +
        'class Dog:' + n +
        '    def __init__(self, name, breed, age):' + n +
        '        self.name = name' + n +
        '        self.breed = breed' + n +
        '        self.age = age' + n + n +
        '    def bark(self):' + n +
        '        print(f"{self.name} says: Woof!")' + n + n +
        '    def description(self):' + n +
        '        print(f"{self.name} is a {self.breed}, {self.age} years old.")' + n + n +
        'dog1 = Dog("Max", "Golden Retriever", 3)' + n +
        'dog2 = Dog("Bella", "Labrador", 2)' + n +
        'dog1.bark()' + n +
        'dog2.description()' + n +
        '```' + n + n +
        '## Real-World: Student Class' + n + n +
        '```python' + n +
        'class Student:' + n +
        '    school = "Campus University"' + n + n +
        '    def __init__(self, name, roll_no, gpa):' + n +
        '        self.name = name' + n +
        '        self.roll_no = roll_no' + n +
        '        self.gpa = gpa' + n + n +
        '    def get_grade(self):' + n +
        '        if self.gpa >= 9: return "Outstanding"' + n +
        '        elif self.gpa >= 7.5: return "Excellent"' + n +
        '        elif self.gpa >= 6: return "Good"' + n +
        '        return "Average"' + n + n +
        '    def __str__(self):' + n +
        '        return f"Student({self.name}, Roll {self.roll_no}, GPA: {self.gpa})"' + n + n +
        's1 = Student("Tirth", 101, 8.5)' + n +
        's2 = Student("Priya", 102, 9.3)' + n +
        'print(s1)' + n +
        'print(f"{s1.name} Grade: {s1.get_grade()}")' + n +
        'print(f"{s2.name} Grade: {s2.get_grade()}")' + n +
        '```'
    ),

    ch('py_ch_12', 12, 'Inheritance and Polymorphism',
        '# Inheritance and Polymorphism' + n + n +
        '**Inheritance** lets a child class inherit from a parent class. **Polymorphism** allows the same method to work differently in different classes.' + n + n +
        '## Inheritance Example' + n + n +
        '```python' + n +
        'class Animal:' + n +
        '    def __init__(self, name, sound):' + n +
        '        self.name = name' + n +
        '        self.sound = sound' + n + n +
        '    def speak(self):' + n +
        '        print(f"{self.name} says {self.sound}!")' + n + n +
        'class Dog(Animal):' + n +
        '    def fetch(self):' + n +
        '        print(f"{self.name} fetches the ball!")' + n + n +
        'class Cat(Animal):' + n +
        '    def purr(self):' + n +
        '        print(f"{self.name} is purring...")' + n + n +
        'dog = Dog("Max", "Woof")' + n +
        'cat = Cat("Luna", "Meow")' + n +
        'dog.speak()' + n +
        'dog.fetch()' + n +
        'cat.speak()' + n +
        'cat.purr()' + n +
        '```' + n + n +
        '## Polymorphism' + n + n +
        '```python' + n +
        'class Circle:' + n +
        '    def __init__(self, radius):' + n +
        '        self.radius = radius' + n +
        '    def area(self):' + n +
        '        return 3.14159 * self.radius ** 2' + n + n +
        'class Rectangle:' + n +
        '    def __init__(self, width, height):' + n +
        '        self.width = width' + n +
        '        self.height = height' + n +
        '    def area(self):' + n +
        '        return self.width * self.height' + n + n +
        'shapes = [Circle(5), Rectangle(4, 6), Circle(3)]' + n +
        'for shape in shapes:' + n +
        '    print(f"{shape.__class__.__name__}: Area = {shape.area():.2f}")' + n +
        '```'
    ),

    ch('py_ch_13', 13, 'Error Handling and Exceptions',
        '# Error Handling and Exceptions' + n + n +
        'Exceptions are runtime errors. Python lets you handle them gracefully using try/except.' + n + n +
        '## Basic try / except' + n + n +
        '```python' + n +
        'def safe_divide(a, b):' + n +
        '    try:' + n +
        '        result = a / b' + n +
        '        return result' + n +
        '    except ZeroDivisionError:' + n +
        '        print("Cannot divide by zero!")' + n +
        '        return None' + n +
        '    except TypeError:' + n +
        '        print("Please use numbers only!")' + n +
        '        return None' + n + n +
        'print(safe_divide(10, 2))' + n +
        'print(safe_divide(10, 0))' + n +
        'print(safe_divide("ten", 2))' + n +
        '```' + n + n +
        '## else and finally' + n + n +
        '```python' + n +
        'try:' + n +
        '    x = int("42")' + n +
        '    print("Converted successfully!")' + n +
        'except ValueError:' + n +
        '    print("Conversion failed!")' + n +
        'else:' + n +
        '    print(f"The value is: {x}")' + n +
        'finally:' + n +
        '    print("Cleanup complete.")' + n +
        '```' + n + n +
        '## Raising Custom Exceptions' + n + n +
        '```python' + n +
        'def validate_age(age):' + n +
        '    if age < 0:' + n +
        '        raise ValueError("Age cannot be negative!")' + n +
        '    if age > 150:' + n +
        '        raise ValueError("Age is unrealistically high!")' + n +
        '    return age' + n + n +
        'try:' + n +
        '    print(validate_age(25))' + n +
        '    print(validate_age(-5))' + n +
        'except ValueError as e:' + n +
        '    print(f"Validation Error: {e}")' + n +
        '```'
    ),

    ch('py_ch_14', 14, 'File Handling',
        '# File Handling in Python' + n + n +
        'Python makes it easy to read and write files using the built-in open() function.' + n + n +
        '## Writing to a File' + n + n +
        '```python' + n +
        'with open("students.txt", "w") as f:' + n +
        '    f.write("Name: Tirth\\n")' + n +
        '    f.write("GPA: 8.5\\n")' + n +
        'print("File written successfully!")' + n +
        '```' + n + n +
        '## Reading from a File' + n + n +
        '```python' + n +
        'with open("students.txt", "r") as f:' + n +
        '    content = f.read()' + n +
        '    print(content)' + n +
        '```' + n + n +
        '## Appending to a File' + n + n +
        '```python' + n +
        'with open("students.txt", "a") as f:' + n +
        '    f.write("Course: Python Programming\\n")' + n +
        'print("Data appended!")' + n +
        '```' + n + n +
        '## Working with JSON as a File' + n + n +
        '```python' + n +
        'import json' + n +
        'data = {"course": "Python", "chapters": 20}' + n +
        'with open("course.json", "w") as f:' + n +
        '    json.dump(data, f, indent=4)' + n +
        'with open("course.json", "r") as f:' + n +
        '    loaded = json.load(f)' + n +
        '    print("Loaded:", loaded)' + n +
        '```'
    ),

    ch('py_ch_15', 15, 'Python Modules and Packages',
        '# Modules and Packages' + n + n +
        'A **module** is a Python file containing functions, classes, and variables.' + n + n +
        '## Built-in Modules' + n + n +
        '```python' + n +
        'import math' + n +
        'import random' + n + n +
        'print("Pi:", math.pi)' + n +
        'print("Square root of 16:", math.sqrt(16))' + n +
        'print("Factorial of 5:", math.factorial(5))' + n + n +
        'print("Random number:", random.randint(1, 100))' + n +
        'items = ["Python", "Java", "C++", "JavaScript"]' + n +
        'print("Random choice:", random.choice(items))' + n +
        '```' + n + n +
        '## The os Module' + n + n +
        '```python' + n +
        'import os' + n +
        'print("Current Directory:", os.getcwd())' + n +
        'print("OS Name:", os.name)' + n +
        '```' + n + n +
        '## Creating a Module (simulation)' + n + n +
        '```python' + n +
        '# Simulating a calculator module' + n +
        'def add(a, b): return a + b' + n +
        'def subtract(a, b): return a - b' + n +
        'def multiply(a, b): return a * b' + n +
        'def divide(a, b): return a / b if b != 0 else None' + n + n +
        'print("5 + 3 =", add(5, 3))' + n +
        'print("10 - 4 =", subtract(10, 4))' + n +
        'print("6 x 7 =", multiply(6, 7))' + n +
        'print("15 / 3 =", divide(15, 3))' + n +
        '```'
    ),

    ch('py_ch_16', 16, 'List Comprehensions and Generators',
        '# List Comprehensions and Generators' + n + n +
        'These are powerful Python features for creating sequences concisely.' + n + n +
        '## List Comprehensions' + n + n +
        '```python' + n +
        'squares = [n**2 for n in range(1, 11)]' + n +
        'print("Squares:", squares)' + n + n +
        'even_squares = [n**2 for n in range(1, 11) if n % 2 == 0]' + n +
        'print("Even squares:", even_squares)' + n + n +
        'matrix = [[1,2,3],[4,5,6],[7,8,9]]' + n +
        'flat = [item for row in matrix for item in row]' + n +
        'print("Flattened:", flat)' + n +
        '```' + n + n +
        '## Dictionary Comprehensions' + n + n +
        '```python' + n +
        'words = ["python", "programming", "is", "fun"]' + n +
        'word_lengths = {word: len(word) for word in words}' + n +
        'print(word_lengths)' + n +
        '```' + n + n +
        '## Generator Functions with yield' + n + n +
        '```python' + n +
        'def countdown(n):' + n +
        '    while n > 0:' + n +
        '        yield n' + n +
        '        n -= 1' + n + n +
        'for number in countdown(5):' + n +
        '    print(number)' + n +
        '```' + n + n +
        '## Generator Expression' + n + n +
        '```python' + n +
        'total = sum(n**2 for n in range(100))' + n +
        'print("Sum of squares 0-99:", total)' + n +
        '```'
    ),

    ch('py_ch_17', 17, 'Decorators and Context Managers',
        '# Decorators and Context Managers' + n + n +
        'Advanced Python features that modify function behavior and manage resources.' + n + n +
        '## Basic Decorator' + n + n +
        '```python' + n +
        'def my_decorator(func):' + n +
        '    def wrapper(*args, **kwargs):' + n +
        '        print("--- Before function call ---")' + n +
        '        result = func(*args, **kwargs)' + n +
        '        print("--- After function call ---")' + n +
        '        return result' + n +
        '    return wrapper' + n + n +
        '@my_decorator' + n +
        'def say_hello(name):' + n +
        '    print(f"Hello, {name}!")' + n + n +
        'say_hello("Tirth")' + n +
        '```' + n + n +
        '## Timing Decorator' + n + n +
        '```python' + n +
        'import time' + n + n +
        'def timer(func):' + n +
        '    def wrapper(*args, **kwargs):' + n +
        '        start = time.time()' + n +
        '        result = func(*args, **kwargs)' + n +
        '        end = time.time()' + n +
        '        print(f"{func.__name__} took {end - start:.4f}s")' + n +
        '        return result' + n +
        '    return wrapper' + n + n +
        '@timer' + n +
        'def slow_function():' + n +
        '    total = sum(range(500000))' + n +
        '    return total' + n + n +
        'result = slow_function()' + n +
        'print("Result:", result)' + n +
        '```' + n + n +
        '## Context Managers (with statement)' + n + n +
        '```python' + n +
        'class DatabaseConnection:' + n +
        '    def __enter__(self):' + n +
        '        print("Connecting to database...")' + n +
        '        return self' + n + n +
        '    def __exit__(self, exc_type, exc_val, exc_tb):' + n +
        '        print("Disconnecting from database...")' + n +
        '        return False' + n + n +
        '    def query(self, sql):' + n +
        '        print(f"Executing: {sql}")' + n + n +
        'with DatabaseConnection() as db:' + n +
        '    db.query("SELECT * FROM students")' + n +
        '    db.query("SELECT * FROM courses")' + n +
        '```'
    ),

    ch('py_ch_18', 18, 'Working with JSON and APIs',
        '# Working with JSON and APIs' + n + n +
        'Modern applications communicate using JSON. Python makes it easy to read, write, and work with JSON.' + n + n +
        '## Python json Module' + n + n +
        '```python' + n +
        'import json' + n + n +
        'student = {' + n +
        '    "name": "Tirth",' + n +
        '    "age": 21,' + n +
        '    "skills": ["Python", "JavaScript", "SQL"],' + n +
        '    "gpa": 8.5' + n +
        '}' + n + n +
        'json_string = json.dumps(student, indent=2)' + n +
        'print("JSON String:")' + n +
        'print(json_string)' + n + n +
        'loaded = json.loads(json_string)' + n +
        'print("Name:", loaded["name"])' + n +
        'print("Skills:", loaded["skills"])' + n +
        '```' + n + n +
        '## Nested JSON Data' + n + n +
        '```python' + n +
        'import json' + n + n +
        'courses_data = {' + n +
        '    "total": 3,' + n +
        '    "courses": [' + n +
        '        {"id": 1, "title": "Python", "level": "Beginner"},' + n +
        '        {"id": 2, "title": "Django", "level": "Intermediate"},' + n +
        '        {"id": 3, "title": "AI/ML", "level": "Advanced"}' + n +
        '    ]' + n +
        '}' + n + n +
        'for course in courses_data["courses"]:' + n +
        '    print(f"{course[\'id\']}. {course[\'title\']} ({course[\'level\']})")' + n + n +
        'print("Total courses:", courses_data["total"])' + n +
        '```'
    ),

    ch('py_ch_19', 19, 'Regular Expressions',
        '# Regular Expressions (re module)' + n + n +
        'Regular expressions are powerful patterns used to search, match, and manipulate text.' + n + n +
        '## Basic Pattern Matching' + n + n +
        '```python' + n +
        'import re' + n + n +
        'text = "My number is 9876543210 and backup is 9123456789."' + n +
        'phones = re.findall(r"\\d{10}", text)' + n +
        'print("Phone numbers found:", phones)' + n +
        '```' + n + n +
        '## Email Validation' + n + n +
        '```python' + n +
        'import re' + n + n +
        'def validate_email(email):' + n +
        '    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"' + n +
        '    return bool(re.match(pattern, email))' + n + n +
        'emails = [' + n +
        '    "student@college.edu",' + n +
        '    "invalid-email",' + n +
        '    "test@.com",' + n +
        '    "valid@example.org"' + n +
        ']' + n + n +
        'for email in emails:' + n +
        '    status = "Valid" if validate_email(email) else "Invalid"' + n +
        '    print(f"{email}: {status}")' + n +
        '```' + n + n +
        '## Text Substitution' + n + n +
        '```python' + n +
        'import re' + n + n +
        'text = "Hello   World!    This  is  Python."' + n +
        'cleaned = re.sub(r"\\s+", " ", text)' + n +
        'print(cleaned)' + n + n +
        'message = "This system has a bug and another bug."' + n +
        'censored = re.sub(r"bug", "***", message)' + n +
        'print(censored)' + n +
        '```'
    ),

    ch('py_ch_20', 20, 'Python Best Practices and Final Project',
        '# Python Best Practices and Final Project' + n + n +
        'You have completed 20 chapters of Python! Time to review best practices and build a final project.' + n + n +
        '## Python Best Practices' + n +
        '- Use descriptive variable names (user_name not un)' + n +
        '- Follow PEP 8 — Pythons official style guide' + n +
        '- Write docstrings to document your functions' + n +
        '- Keep functions small — one function = one responsibility' + n +
        '- Do not repeat yourself (DRY principle)' + n +
        '- Always handle errors with try/except' + n + n +
        '## Docstrings' + n + n +
        '```python' + n +
        'def calculate_bmi(weight_kg, height_m):' + n +
        '    """' + n +
        '    Calculate Body Mass Index.' + n +
        '    Args:' + n +
        '        weight_kg (float): Weight in kilograms' + n +
        '        height_m (float): Height in meters' + n +
        '    Returns:' + n +
        '        float: BMI value' + n +
        '    """' + n +
        '    return round(weight_kg / height_m ** 2, 2)' + n + n +
        'bmi = calculate_bmi(70, 1.75)' + n +
        'print(f"BMI: {bmi}")' + n +
        '```' + n + n +
        '## Final Project: Student Grade Manager' + n + n +
        '```python' + n +
        'class GradeManager:' + n +
        '    def __init__(self):' + n +
        '        self.students = {}' + n + n +
        '    def add_student(self, name, *scores):' + n +
        '        self.students[name] = list(scores)' + n + n +
        '    def average(self, name):' + n +
        '        scores = self.students.get(name, [])' + n +
        '        return sum(scores) / len(scores) if scores else 0' + n + n +
        '    def grade(self, name):' + n +
        '        avg = self.average(name)' + n +
        '        if avg >= 90: return "A+"' + n +
        '        if avg >= 80: return "A"' + n +
        '        if avg >= 70: return "B"' + n +
        '        if avg >= 60: return "C"' + n +
        '        return "F"' + n + n +
        '    def class_report(self):' + n +
        '        print("\\n===== CLASS REPORT =====")' + n +
        '        for name in self.students:' + n +
        '            avg = self.average(name)' + n +
        '            g = self.grade(name)' + n +
        '            print(f"{name:<15} | Avg: {avg:5.1f} | Grade: {g}")' + n +
        '        print("========================")' + n + n +
        '    def top_student(self):' + n +
        '        return max(self.students, key=lambda n: self.average(n))' + n + n +
        'gm = GradeManager()' + n +
        'gm.add_student("Tirth", 88, 92, 85, 90)' + n +
        'gm.add_student("Priya", 95, 97, 91, 93)' + n +
        'gm.add_student("Raj", 72, 68, 75, 70)' + n +
        'gm.class_report()' + n +
        'print(f"\\nTop Student: {gm.top_student()}")' + n +
        '```' + n + n +
        '**Congratulations! You have completed the Python Programming course!**' + n + n +
        'You now know variables, data types, control flow, loops, lists, tuples, sets, dictionaries, functions, OOP, file handling, modules, JSON, error handling, regex, decorators, and more. Keep building real projects!'
    ),
];

const PYTHON_COURSE = {
    title: 'Python Programming: From Beginner to Pro',
    description: 'A complete Python programming course covering fundamentals, data structures, OOP, file handling, modules, web APIs, and much more — with hands-on interactive code examples in every chapter.',
    instructor: 'CampusRecruit AI Team',
    level: 'Beginner',
    category: 'Development',
    duration: '18h 40m',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/1869px-Python-logo-notext.svg.png',
    status: 'published',
    createdBy: 'employee@campusrecruit.com',
    chapters,
};

async function seed() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const existing = await Course.findOne({ title: PYTHON_COURSE.title });
        if (existing) {
            await Course.deleteOne({ _id: existing._id });
            console.log('Removed existing Python course');
        }

        const course = await Course.create(PYTHON_COURSE);
        console.log('');
        console.log('Python course created successfully!');
        console.log('   ID: ' + course._id);
        console.log('   Title: ' + course.title);
        console.log('   Chapters: ' + course.chapters.length);
        console.log('');
        console.log('Student course URL:');
        console.log('   http://localhost:5174/courses/' + course._id);
        console.log('');
    } catch (err) {
        console.error('Seeding failed:', err.message);
        if (err.errors) {
            Object.keys(err.errors).forEach(k => console.error(' -', k, ':', err.errors[k].message));
        }
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

seed();
