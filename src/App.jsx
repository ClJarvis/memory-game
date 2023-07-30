import { useState, useEffect } from "react";
import Nav from "./Nav.jsx";
import Card from "./Card.jsx";
import Modal from "./Modal.jsx";
import "./style.css";

export default function App() {
  const [nRows, setNRows] = useState(9);
  const [nColumns, setNColumns] = useState(12);
  const [cards, setCards] = useState(createLayout());
  const [flippedCardIds, setFlippedCardIds] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  function createLayout() {
    // Create an array to hold the card values
    const cardsArray = [];
    const nCards = nRows * nColumns;

    for (let i = 1; i <= nCards / 2; i++) {
      const cardImage = `/card${i}.jpg`;
      cardsArray.push({
        value: i,
        imageUrl: cardImage,
        isVisible: true,
        isFlipped: false,
        id: 2 * i - 2,
      });
      // Duplicate each card's value to create pairs
      cardsArray.push({
        value: i,
        imageUrl: cardImage,
        isVisible: true,
        isFlipped: false,
        id: 2 * i - 1,
      });
    }
    // Permute the array.
    for (let i = nCards - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i);
      const tempCard = cardsArray[i];
      cardsArray[i] = cardsArray[j];
      cardsArray[j] = tempCard;
    }
    return cardsArray;
  }

  useEffect(() => {
    console.log("in reset game");
    // Start over when user chooses new configuration.
    setCards(createLayout());
    setFlippedCardIds([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nRows, nColumns]);

  useEffect(() => {
    if (gameOver) {
      console.log("in gameOver");
      openModal();
      setGameOver(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]);

  function flipCard(id) {
    if (flippedCardIds.length === 2) {
      // user can't flip any more cards. check for match, turn cards over or remove.
      const card1 = cards.find((card) => card.id === flippedCardIds[0]);
      const card2 = cards.find((card) => card.id === flippedCardIds[1]);
      const newArr = cards.map((card) => {
        if (card.id === flippedCardIds[0] || card.id === flippedCardIds[1]) {
          card.isFlipped = false;
          if (card1.value === card2.value)
            // Remove the card from the grid.
            card.isVisible = false;
        }
        return card;
      });
      setCards(newArr);
      setFlippedCardIds([]);
      // Check for game over
      if (!cards.find((card) => card.isVisible)) setGameOver(true);
      return;
    }
    // Don't let the user flip a removed card.
    const card = cards.find((card) => card.id === id);
    if (card.isVisible === false) return;

    // Don't let the user turn the first card back over.
    if (flippedCardIds.length === 1 && flippedCardIds[0] === id) return;

    const newArr = cards.map((card) => {
      if (card.id === id) card.isFlipped = true;
      return card;
    });
    setCards(newArr);
    setFlippedCardIds((oldArray) => [...oldArray, id]);
  }

  const cardDivs = cards.map((card) => {
    // flipCard is the onClick callback function for each card.
    return (
      <Card
        isVisible={card.isVisible}
        imageUrl={card.imageUrl}
        flipCard={() => flipCard(card.id)}
        isFlipped={card.isFlipped}
        value={card.value}
        key={card.id}
      />
    );
  });

  function setNumColumns(numColumns) {
    setNColumns(numColumns);
  }

  function setNumRows(numRows) {
    setNRows(numRows);
  }

  function openModal() {
    const modal = document.querySelector('[data-id="modal"]');
    console.log(modal);
    modal.classList.remove("hidden");
  }

  function closeModal() {
    const modal = document.querySelector('[data-id="modal"]');
    modal.classList.add("hidden");
  }

  function restartGame() {
    closeModal();
    setCards(createLayout());
  }

  return (
    <main>
      <Nav
        numRows={nRows}
        numColumns={nColumns}
        onSetNumRows={setNumRows}
        onSetNumColumns={setNumColumns}
      />
      <div
        className="card-container"
        style={{
          gridTemplateColumns: `repeat(${nColumns}, 1fr)`,
          gridTemplateRows: `repeat(${nRows}, 1fr)`,
          maxWidth: `${nColumns * 100}px`,
        }}
      >
        {cardDivs}
      </div>
      <Modal restart={restartGame} />
    </main>
  );
}