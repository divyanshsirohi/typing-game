export interface CodeSnippet {
    id: string;
    language: "python" | "javascript" | "cpp" | "go";
    title: string;
    difficulty: "easy" | "medium" | "hard";
    code: string;
}

export const CODE_SNIPPETS: CodeSnippet[] = [
    {
        id: "python-1",
        language: "python",
        title: "FastAPI JWT Auth",
        difficulty: "medium",
        code: `from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class User(BaseModel):
    username: str

SECRET_KEY = "a_very_secret_key"
ALGORITHM = "HS256"

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return User(username=payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/users/me")
def read_users_me(token: str = Depends(oauth2_scheme)):
    user = verify_token(token)
    return user`
    },
    {
        id: "python-2",
        language: "python",
        title: "Celery + Redis Task Queue",
        difficulty: "medium",
        code: `from celery import Celery

app = Celery('tasks', broker='redis://localhost:6379/0')

@app.task
def add(x, y):
    return x + y`
    },
    {
        id: "python-3",
        language: "python",
        title: "SQLAlchemy ORM with SQLite",
        difficulty: "medium",
        code: `from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()
engine = create_engine('sqlite:///users.db')
Session = sessionmaker(bind=engine)

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String)

Base.metadata.create_all(engine)
session = Session()
session.add(User(name='Sirohi'))
session.commit()`
    },
    {
        id: "js-1",
        language: "javascript",
        title: "Express JWT Middleware",
        difficulty: "medium",
        code: `const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = express();

const UserSchema = new mongoose.Schema({ username: String });
const User = mongoose.model('User', UserSchema);

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get('/profile', authenticateToken, async (req, res) => {
  const user = await User.findOne({ username: req.user.username });
  res.json(user);
});`
    },
    {
        id: "js-2",
        language: "javascript",
        title: "File Upload with Multer",
        difficulty: "easy",
        code: `const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();

app.post('/upload', upload.single('file'), (req, res) => {
  res.send('File uploaded: ' + req.file.originalname);
});`
    },
    {
        id: "js-3",
        language: "javascript",
        title: "PostgreSQL Connection using pg",
        difficulty: "medium",
        code: `const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'testdb',
  password: 'password',
  port: 5432,
});

pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res.rows);
  pool.end();
});`
    },
    {
        id: "cpp-1",
        language: "cpp",
        title: "Crow C++ Web Server",
        difficulty: "hard",
        code: `#include "crow_all.h"

int main() {
    crow::SimpleApp app;

    CROW_ROUTE(app, "/hello")([](){
        return "Hello, backend C++!";
    });

    CROW_ROUTE(app, "/json")([]{
        crow::json::wvalue x;
        x["message"] = "Hello, JSON!";
        return x;
    });

    app.port(8080).multithreaded().run();
}`
    },
    {
        id: "cpp-2",
        language: "cpp",
        title: "C++17 Filesystem Walker",
        difficulty: "easy",
        code: `#include <iostream>
#include <filesystem>

namespace fs = std::filesystem;

int main() {
    for (const auto& entry : fs::recursive_directory_iterator("./")) {
        std::cout << entry.path() << std::endl;
    }
    return 0;
}`
    },
    {
        id: "cpp-3",
        language: "cpp",
        title: "Thread Pool Implementation",
        difficulty: "hard",
        code: `#include <iostream>
#include <vector>
#include <thread>
#include <queue>
#include <functional>
#include <mutex>
#include <condition_variable>

class ThreadPool {
public:
    ThreadPool(size_t n) {
        for (size_t i = 0; i < n; ++i)
            workers.emplace_back([this]() {
                while (true) {
                    std::function<void()> task;
                    {
                        std::unique_lock<std::mutex> lock(mtx);
                        cv.wait(lock, [&]() { return !tasks.empty(); });
                        task = std::move(tasks.front());
                        tasks.pop();
                    }
                    task();
                }
            });
    }

    void enqueue(std::function<void()> f) {
        {
            std::lock_guard<std::mutex> lock(mtx);
            tasks.push(std::move(f));
        }
        cv.notify_one();
    }

private:
    std::vector<std::thread> workers;
    std::queue<std::function<void()>> tasks;
    std::mutex mtx;
    std::condition_variable cv;
};`
    },
    {
        id: "go-1",
        language: "go",
        title: "Go Fiber JWT Auth",
        difficulty: "medium",
        code: `package main

import (
    "github.com/gofiber/fiber/v2"
    "github.com/golang-jwt/jwt/v5"
    "time"
)

func generateToken(username string) (string, error) {
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "username": username,
        "exp":      time.Now().Add(time.Hour * 1).Unix(),
    })
    return token.SignedString([]byte("secret"))
}

func protected(c *fiber.Ctx) error {
    tokenStr := c.Get("Authorization")[7:]
    token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
        return []byte("secret"), nil
    })
    if err != nil || !token.Valid {
        return c.SendStatus(fiber.StatusUnauthorized)
    }
    return c.SendString("Welcome to the protected route!")
}

func main() {
    app := fiber.New()

    app.Post("/login", func(c *fiber.Ctx) error {
        token, _ := generateToken("backend_gopher")
        return c.JSON(fiber.Map{"token": token})
    })

    app.Get("/dashboard", protected)

    app.Listen(":3000")
}`
    },
    {
        id: "go-2",
        language: "go",
        title: "Goroutine Worker Pool",
        difficulty: "medium",
        code: `package main

import (
    "fmt"
    "time"
)

func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Printf("worker %d started job %d\\n", id, j)
        time.Sleep(time.Second)
        fmt.Printf("worker %d finished job %d\\n", id, j)
        results <- j * 2
    }
}

func main() {
    jobs := make(chan int, 5)
    results := make(chan int, 5)

    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)
    }

    for j := 1; j <= 5; j++ {
        jobs <- j
    }
    close(jobs)

    for a := 1; a <= 5; a++ {
        <-results
    }
}`
    }
];
