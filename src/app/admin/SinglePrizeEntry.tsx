import React from "react";
import styles from "./page.module.css";

const SinglePrizeEntry = ({ index, prizeEntry, onChange, onRemove }) => {
  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    onChange(index, { ...prizeEntry, [name]: value });
  };

  return (
    <div className={styles.singlePrizeData}>
      <input
        type="text"
        name="prizeName"
        value={prizeEntry.prizeName}
        onChange={(e) => handleInputChange(index, e)}
      />
      <input
        type="number"
        name="size"
        value={prizeEntry.size}
        onChange={(e) => handleInputChange(index, e)}
      />
      <input
        type="number"
        name="probability"
        value={prizeEntry.probability}
        onChange={(e) => handleInputChange(index, e)}
      />
      <button onClick={() => onRemove(index)}>Remove</button>
    </div>
  );
};

export default SinglePrizeEntry;
