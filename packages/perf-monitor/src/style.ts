export default `
:host { all: initial; }

.root {
  position: fixed;
  left: 12px;
  bottom: 12px;
  z-index: 10000;
  max-width: calc(100vw - 24px);
  font: 12px/16px ui-sans-serif, system-ui, sans-serif;
  color: #e5e7eb;
  user-select: none;
  -webkit-user-select: none;
}

.box {
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-sizing: border-box;
}

.details {
  width: 320px;
  max-width: 100%;
  margin-bottom: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.details[hidden],
.row[hidden] { display: none; }

.row { display: flex; align-items: center; gap: 12px; }
.row .label { width: 56px; flex-shrink: 0; color: #6b7280; }
.row .value {
  width: 112px;
  flex-shrink: 0;
  text-align: right;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.row svg { flex: 1; min-width: 0; }

.bar {
  display: inline-flex;
  max-width: 100%;
  align-items: stretch;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.cell { min-width: 112px; padding: 8px 12px; box-sizing: border-box; }

.divider { width: 1px; align-self: stretch; background: rgba(255, 255, 255, 0.1); }

button.cell {
  position: relative;
  padding-right: 28px;
  border: 0;
  margin: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  border-radius: 0 8px 8px 0;
  transition: background-color 0.15s;
}
button.cell:hover { background: rgba(255, 255, 255, 0.05); }

.arrow { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #6b7280; }

.metric { display: flex; flex-direction: column-reverse; align-items: flex-start; gap: 4px; }
.metric > div { display: flex; align-items: center; gap: 8px; }
.metric .label { color: #6b7280; }
.metric .value { font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
.metric svg { flex-shrink: 0; }

@media (min-width: 640px) {
  .cell { min-width: 172px; }
  .metric { flex-direction: row; align-items: center; justify-content: space-between; gap: 8px; }
}
`;
