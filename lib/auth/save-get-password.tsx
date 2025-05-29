// DEPRECATED (for now)
// these functions save passwords into the user's local storage

export function saveBoardPassword(boardId: string, password: string) {
  localStorage.setItem(
    `mudboard:auth:${boardId}`,
    JSON.stringify({ password })
  );
}

export function getBoardPassword(boardId: string): string | null {
  const raw = localStorage.getItem(`mudboard:auth:${boardId}`);
  try {
    return raw ? JSON.parse(raw).password : null;
  } catch {
    return null;
  }
}

export function clearBoardPassword(boardId: string) {
  localStorage.removeItem(`mudboard:auth:${boardId}`);
}
