require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_recruit')
    .then(() => console.log('✅ Connected to MongoDB for seeding'))
    .catch(err => { console.error('MongoDB connection error:', err); process.exit(1); });

const seedPythonCourse = async () => {
    try {
        const pythonCourse = {
            title: 'Python for Beginners (Interactive)',
            description: 'Master Python fundamentals with interactive, in-browser code execution natively built into the coursework!',
            instructor: 'AI Assistant',
            thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg',
            duration: '5 hours',
            level: 'Beginner',
            category: 'Data Science',
            price: 'Free',
            status: 'published',
            chapters: [
                {
                    chapterId: 'py1',
                    title: 'Hello Python',
                    content: `## 1. Intro to Python

Python is one of the easiest and most powerful languages in the world. Let's write our first program! The \`print()\` function allows us to output text to the screen.

### Example

\`\`\`python
print("Hello, World!")
print("Welcome to the interactive Python Editor.")
\`\`\`

Try modifying the code above to print your own name!`,
                    order: 1
                },
                {
                    chapterId: 'py2',
                    title: 'Variables & Data Types',
                    content: `## 2. Variables

Variables are containers for storing data values. Unlike other languages, Python has no command for declaring a variable. A variable is created the moment you first assign a value to it.

### Example

\`\`\`python
# Creating variables
name = "Alice"
age = 25
is_student = True

print(f"{name} is {age} years old.")
print("Is a student?", is_student)
\`\`\`

Notice the \`f"..."\` syntax? Those are called **f-strings** and they allow us to inject variables directly into our text!`,
                    order: 2
                },
                {
                    chapterId: 'py3',
                    title: 'Math & Logic',
                    content: `## 3. Operations

Python is fantastic at math. We can easily do addition (+), subtraction (-), multiplication (*), and division (/).

Let's calculate the area of a circle where the radius is 5!

### Example

\`\`\`python
pi = 3.14159
radius = 5

# The ** operator is used for exponents (radius squared)
area = pi * (radius ** 2)

print(f"The area of a circle with radius {radius} is: {area}")
\`\`\`

Try changing the radius from 5 to 10 and click **Try it Yourself** to see how the output changes!`,
                    order: 3
                },
                {
                    chapterId: 'py4',
                    title: 'Conditionals (If...Else)',
                    content: `## 4. Control Flow

Python uses boolean logic to evaluate conditions. We use \`if\`, \`elif\`, and \`else\` keywords. Notice that Python uses **indentation** (spaces or tabs) to define blocks of code instead of curly braces \`{}\`.

### Example

\`\`\`python
player_score = 85

if player_score >= 90:
    print("Grade: A")
elif player_score >= 80:
    print("Grade: B")
elif player_score >= 70:
    print("Grade: C")
else:
    print("Grade: F")
    
print("Evaluation complete.")
\`\`\`

What happens if you change \`player_score\` to 95? Go ahead and test it.`,
                    order: 4
                },
                {
                    chapterId: 'py5',
                    title: 'Loops (For & While)',
                    content: `## 5. Iteration

When you need to repeat a task, loops are your best friend. A \`for\` loop iterates over a sequence (like a list or a string).

### Example

\`\`\`python
# A simple list of fruits
fruits = ["apple", "banana", "cherry"]

print("My Grocery List:")
for fruit in fruits:
    print("- " + fruit)

print("\\nCounting to 5:")
# The range(x) function generates numbers from 0 up to x-1
for i in range(5):
    print(i + 1)
\`\`\`

Try adding "mango" to the fruits list and rerunning the code.`,
                    order: 5
                },
                {
                    chapterId: 'py6',
                    title: 'Functions',
                    content: `## 6. Reusable Code

Functions let you write a block of code once and use it many times. You define a function using the \`def\` keyword.

### Example

\`\`\`python
def greet_user(name, time_of_day="morning"):
    """This function greets a user."""
    return f"Good {time_of_day}, {name}!"

# Calling the function
message1 = greet_user("Tirth")
message2 = greet_user("Alice", "evening")

print(message1)
print(message2)
\`\`\`

Functions make your code organized and easy to maintain. Congratulations, you've reached the end of the beginner course!`,
                    order: 6
                }
            ]
        };

        // Remove any existing identical course to avoid duplicates if ran multiple times
        await Course.findOneAndDelete({ title: pythonCourse.title });

        const createdCourse = await Course.create(pythonCourse);
        console.log(`✅ Successfully injected new course: "${createdCourse.title}" with ${createdCourse.chapters.length} interactive chapters.`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding Python course:', error);
        process.exit(1);
    }
};

seedPythonCourse();
