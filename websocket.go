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
}

func main() {
	fmt.Println("Server started")
	hub := []*websocket.Conn{}
	http.Handle("/connws/", websocket.Handler(func(ws *websocket.Conn) {
		hub = append(hub, ws)
		var data Data
		for {
			err := websocket.JSON.Receive(ws, &data)
			if err != nil {
				fmt.Println(err)
				ws.Close()
				break
			}
			result, _ := json.Marshal(data)
			for _, i := range hub {
				fmt.Println(data.Content)
				websocket.Message.Send(i, string(result))
			}
		}
	}))

	http.ListenAndServe(":9999", nil)
}
