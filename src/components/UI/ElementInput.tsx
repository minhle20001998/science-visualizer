import { useState } from "react";
import { useStore } from "../../store/useStore";
import { getElement, ELEMENTS } from "../../data/elements";

const VALENCE_COLORS = [
  "#4af0ff",
  "#5b8def",
  "#a66cff",
  "#ff6b6b",
  "#ffd93d",
  "#4a9eff",
  "#66dd88",
];

export function ElementInput() {
  const atomicNumber = useStore((s) => s.atomicNumber);
  const setAtomicNumber = useStore((s) => s.setAtomicNumber);
  const [inputValue, setInputValue] = useState(String(atomicNumber));

  const element = getElement(atomicNumber);

  const handleNumberChange = (val: string) => {
    setInputValue(val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 1 && n <= 118) {
      setAtomicNumber(n);
    }
  };

  const handleSelectChange = (z: number) => {
    setAtomicNumber(z);
    setInputValue(String(z));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            color: "var(--text-dim)",
            whiteSpace: "nowrap",
          }}
        >
          Element
        </span>
        <input
          type="number"
          min="1"
          max="118"
          value={inputValue}
          onChange={(e) => handleNumberChange(e.target.value)}
          style={{ width: "60px" }}
        />
        <select
          value={atomicNumber}
          onChange={(e) => handleSelectChange(Number(e.target.value))}
          style={{ minWidth: "150px" }}
        >
          {ELEMENTS.map((el) => (
            <option key={el.z} value={el.z}>
              {el.z}. {el.symbol} — {el.name}
            </option>
          ))}
        </select>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          paddingLeft: "2px",
        }}
      >
        <span
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--accent)",
            minWidth: "30px",
            textAlign: "center",
          }}
        >
          {element.symbol}
        </span>
        <span
          style={{
            fontSize: "12px",
            color: "var(--text-dim)",
          }}
        >
          {element.name}
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginLeft: "4px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              color: "var(--text-dim)",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}
          >
            Valence
          </span>
          {element.valences.length === 0 ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "20px",
                height: "18px",
                padding: "0 6px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: 600,
                color: "#666677",
                background: "#66667722",
                border: "1px solid #66667744",
              }}
            >
              0
            </span>
          ) : (
            element.valences.map((v, i) => (
              <span
                key={v}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "20px",
                  height: "18px",
                  padding: "0 6px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: VALENCE_COLORS[i % VALENCE_COLORS.length],
                  background: `${VALENCE_COLORS[i % VALENCE_COLORS.length]}22`,
                  border: `1px solid ${VALENCE_COLORS[i % VALENCE_COLORS.length]}44`,
                }}
              >
                {v}
              </span>
            ))
          )}
        </div>
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "var(--text-dim)",
          lineHeight: 1.3,
          maxWidth: "360px",
          paddingLeft: "2px",
        }}
      >
        {element.description}
      </div>
    </div>
  );
}
