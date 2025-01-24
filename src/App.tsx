import { useState, useEffect } from "react";
import "./App.css";
import "./index.css";

interface Quote {
  question: string;
  movie: string;
  wrongOptions: string[];
  type?: string; // Optional type property
}

// Define available categories
const categories = ["港產片", "Mirror", "IMDB Top 250", "All Categories"];

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Quote[]>([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [score, setScore] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]); // Default to first category
  const [buttonsDisabled, setButtonsDisabled] = useState(false); // New state for button disabling

  const fetchQuotes = async (category: string) => {
    if (category === "All Categories") {
      // Fetch from all categories
      const allQuotes: Quote[] = [];
      for (const cat of categories.slice(0, -1)) {
        // Exclude "ALL" from the categories
        const response = await fetch(`./Quotes/${cat}.json`);
        if (!response.ok) {
          console.error(
            `Failed to fetch quotes for category: ${cat}, Status: ${response.status}`
          );
          continue; // Skip this category if there's an error
        }
        try {
          const data: Quote[] = await response.json();
          allQuotes.push(...data);
        } catch (error) {
          console.error(`Error parsing JSON for category: ${cat}`, error);
        }
      }
      const shuffled = allQuotes.sort(() => 0.5 - Math.random());
      setSelectedQuestions(shuffled.slice(0, 10));
    } else {
      const response = await fetch(`./Quotes/${category}.json`);
      if (!response.ok) {
        console.error(
          `Failed to fetch quotes for category: ${category}, Status: ${response.status}`
        );
        return; // Exit if there's an error
      }
      try {
        const data: Quote[] = await response.json();
        const shuffled = data.sort(() => 0.5 - Math.random());
        setSelectedQuestions(shuffled.slice(0, 10));
      } catch (error) {
        console.error(`Error parsing JSON for category: ${category}`, error);
      }
    }
  };

  useEffect(() => {
    fetchQuotes(selectedCategory); // Fetch quotes when category changes
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedQuestions.length > 0) {
      const currentQuestion = selectedQuestions[currentQuoteIndex];
      const options = [...currentQuestion.wrongOptions, currentQuestion.movie];
      setShuffledOptions(options.sort(() => Math.random() - 0.5));
      setCorrectAnswer(currentQuestion.movie);
    }
  }, [currentQuoteIndex, selectedQuestions]);

  const handleAnswer = (answer: string) => {
    if (buttonsDisabled) return; // Prevent further actions if buttons are disabled
    setSelectedAnswer(answer);
    const currentQuestion = selectedQuestions[currentQuoteIndex];
    if (answer === currentQuestion.movie) {
      setScore((prevScore) => prevScore + 1);
    }

    setButtonsDisabled(true); // Disable buttons after an answer is selected

    // Move to the next question after a delay
    setTimeout(() => {
      setSelectedAnswer("");
      setButtonsDisabled(false); // Re-enable buttons after delay
      if (currentQuoteIndex + 1 < selectedQuestions.length) {
        setCurrentQuoteIndex((prevIndex) => prevIndex + 1);
      } else {
        // Set game over state when all questions have been answered
        setIsGameOver(true);
      }
    }, 1500);
  };

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCategory(event.target.value);
  };

  return (
    <>
      {!gameStarted ? (
        <div>
          <h1>Welcome to Film Guessing Game!</h1>
          <p>
            Pick which category you want to play and click the button below to
            start to answer 10 questions!
          </p>
          <div>
            <h4>Choose a Category</h4>
            <select value={selectedCategory} onChange={handleCategoryChange}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
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
            <div className="game-over">
              <h2>
                Game Over! Your score for {selectedCategory}: {score} out of{" "}
                {selectedQuestions.length}
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
              <h2>{selectedQuestions[currentQuoteIndex].question}</h2>
              <div className="button-container">
                {shuffledOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    disabled={buttonsDisabled} // Disable button if buttonsDisabled is true
                    className={`answer-button ${
                      selectedAnswer === option
                        ? option === correctAnswer
                          ? "correct"
                          : "incorrect"
                        : ""
                    }`} // Add classes based on answer
                  >
                    {option}
                  </button>
                ))}
              </div>
              {selectedAnswer && (
                <p>
                  {selectedAnswer === selectedQuestions[currentQuoteIndex].movie
                    ? "Correct!"
                    : "Wrong! The correct answer is " +
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
