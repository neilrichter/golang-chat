package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"golang.org/x/net/websocket"
)

// Data structure
type Data struct {
	Type     string `json:"type"`
	Nickname string `json:"nickname"`
	Content  string `json:"content"`
	Old      string `json:"old"`
	New      string `json:"new"`
	PrevX    int    `json:"prevX"`
	PrevY    int    `json:"prevY"`
	CurrX    int    `json:"currX"`
	CurrY    int    `json:"currY"`
}

var count = 0
var hub = make(map[int]*websocket.Conn)

func main() {
	fmt.Println("Server started")
	http.Handle("/connws/", websocket.Handler(func(ws *websocket.Conn) {
		current := connexion(ws)
		fmt.Println("The hub:", hub)
		var data Data
		for {
			err := websocket.JSON.Receive(ws, &data)
			if err != nil {
				delete(hub, current)
				ws.Close()
				fmt.Println("The hub:", hub)
				return
			}
			result, _ := json.Marshal(data)
			for _, i := range hub {
				_ = websocket.Message.Send(i, string(result))
			}
		}
	}))

	http.ListenAndServe(":9999", nil)
}

func connexion(ws *websocket.Conn) int {
	hub[count] = ws
	current := count
	count++
	return current
}
