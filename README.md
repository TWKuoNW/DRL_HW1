# DRL HW1-1: Grid Map Development

This repository contains the implementation of **HW1-1: Grid Map Development** for a Deep Reinforcement Learning (DRL) course. 

## 網頁預覽 (Live Demo)
您可以點擊以下連結直接在瀏覽器中預覽並操作網格地圖：
👉 **[網格地圖 - GitHub Pages](https://twkuonw.github.io/DRL_HW1/)**

## 專案功能 (Features)
本專案為一個基於 HTML、CSS 與 JavaScript 實作的互動式網格地圖，具備以下功能：
1. **動態生成網格**：允許使用者輸入維度 $n$ (範圍 5 到 9) 來生成大小為 $n \times n$ 的方格地圖。
2. **設定起點與終點**：
   - 使用者可以透過點擊單元格設定「起點」，點擊後顯示為**綠色**。
   - 接著設定「終點」，點擊後顯示為**紅色**。
3. **設定障礙物**：
   - 設置完起點及終點後，使用者需設定 $n - 2$ 個「障礙物」，點擊後這些單元格顯示為**灰色**。
4. **直覺的 UI 設計**：具備俐落的毛玻璃 (Glassmorphism) 排版、清楚的狀態提示與 RWD (Responsive Web Design) 響應式設計，提供友好的使用者介面與操作流暢度。

## 檔案結構 (Project Structure)
本專案為純靜態前端架構，無後端依賴，主要檔案包含：
- `index.html`: 網頁的骨架與結構。
- `static/style.css`: 包含版面樣式、顏色狀態及毛玻璃特效。
- `static/script.js`: 負責處理網格生成的邏輯、滑鼠點擊事件以及狀態切換 (起點 $\rightarrow$ 終點 $\rightarrow$ 障礙物)。

## 本地執行方式 (Local Usage)
1. 將本專案 Clone 到您的本機環境：
   ```bash
   git clone https://github.com/TWKuoNW/DRL_HW1.git
   ```
2. 直接點擊開啟 `index.html`，或是透過任何本地伺服器如 VS Code Live Server，即可在瀏覽器中使用。
