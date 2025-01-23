import { useState, useEffect } from "react";
import "./App.css";

interface Quote {
  quote: string;
  movie: string;
  wrongOptions: string[];
}

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Quote[]>([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [score, setScore] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");

  useEffect(() => {
    const fetchQuotes = async () => {
      const response = await fetch("./Quotes/sample.json");
      const data: Quote[] = await response.json();
      const shuffled = data.sort(() => 0.5 - Math.random());
      setSelectedQuestions(shuffled.slice(0, 10));
    };

    fetchQuotes();
  }, []);

  useEffect(() => {
    if (selectedQuestions.length > 0) {
      const currentQuestion = selectedQuestions[currentQuoteIndex];
      const options = [...currentQuestion.wrongOptions, currentQuestion.movie];
      setShuffledOptions(options.sort(() => Math.random() - 0.5));
      setCorrectAnswer(currentQuestion.movie);
    }
  }, [currentQuoteIndex, selectedQuestions]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const currentQuestion = selectedQuestions[currentQuoteIndex];
    if (answer === currentQuestion.movie) {
      setScore((prevScore) => prevScore + 1);
    }

    // Move to the next question after a delay
    setTimeout(() => {
      setSelectedAnswer("");
      if (currentQuoteIndex + 1 < selectedQuestions.length) {
        setCurrentQuoteIndex((prevIndex) => prevIndex + 1);
      } else {
        // Set game over state when all questions have been answered
        setIsGameOver(true);
      }
    }, 1000);
  };

  return (
    <>
      {!gameStarted ? (
        <div>
          <h1>Welcome to My Game!</h1>
          <p>
            Get ready for an exciting adventure. Click the button below to
            start!
          </p>
          <div className="card">
            <button onClick={() => setGameStarted(true)}>Start Game</button>
          </div>
        </div>
      ) : (
        <div>
          <h2>
            Question {currentQuoteIndex + 1} of {selectedQuestions.length}
          </h2>
          {isGameOver ? (
            <div>
              <h2>
                Game Over! Your score: {score} out of {selectedQuestions.length}
              </h2>
              <button
                onClick={() => {
                  setGameStarted(false);
                  setIsGameOver(false);
                  setCurrentQuoteIndex(0);
                  setScore(0);
                }}
              >
                Start Again
              </button>
            </div>
          ) : (
            <>
              <h2>{selectedQuestions[currentQuoteIndex].quote}</h2>
              <div>
                {shuffledOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    style={{
                      backgroundColor:
                        selectedAnswer === option
                          ? "lightblue" // Highlight selected answer
                          : selectedAnswer && correctAnswer === option // Check if the option is the correct answer after selection
                          ? "lightgreen" // Highlight correct answer
                          : "white", // Default color
                      color: "black", // Change text color to black for visibility
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {selectedAnswer && (
                <p>
                  {selectedAnswer === selectedQuestions[currentQuoteIndex].movie
                    ? "Correct!"
                    : "Wrong! The correct answer was: " +
                      selectedQuestions[currentQuoteIndex].movie}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

export default App;
