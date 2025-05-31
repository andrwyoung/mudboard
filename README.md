Hi. This is Mudboard's repo

The main entry point is /app/b/\[boardId\]/board.tsx

This is where you'll see how each board is created

Another place to note is /lib/db-actions. this is the folder where we sync and make changes to the database

Lastly, this project is very hook heavy. The main one being
/hooks/gallery/use-drag-handlers.tsx

/hooks/use-import-images.tsx and /hooks/use-init-board.tsx are also of note

### Setup

1. you need our .env files to access the database
2. npm i && npm run dev

note: there is a secret repo where we host the proxy, but that's not required for setup
