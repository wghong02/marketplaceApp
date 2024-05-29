package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"appBE/model"
	"appBE/service"

	jwt "github.com/form3tech-oss/jwt-go"
	"github.com/gorilla/mux"
)

func uploadProductHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Received one upload request")
	// check data type
	if r.Header.Get("Content-Type") != "application/json" {
        http.Error(w, "Content-Type is not application/json", http.StatusUnsupportedMediaType)
        return
    }
    // check auth
    token := r.Context().Value("user")
    claims := token.(*jwt.Token).Claims
    userIDFloat, ok := claims.(jwt.MapClaims)["userID"].(float64)
    if !ok {
        http.Error(w, "Invalid user ID", http.StatusInternalServerError)
        return
    }
    userID := int64(userIDFloat)
    
    // 1. process data
    // Parse from body of request to get a json object.
    decoder := json.NewDecoder(r.Body)
    product := model.Product{
        SellerID: userID,
        PutOutDate: time.Now(),
    }

    // 2. call service to save product
    if err := decoder.Decode(&product); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        fmt.Fprintf(w, "Error decoding upload request: %v", err)
        return
    }

    if err := service.UploadProduct(&product); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // 3. response

    fmt.Fprintf(w, "Product saved successfully\n")
    fmt.Fprintf(w, "Uploaded %s by %d \n", product.Title, userID)
}

func deleteProductHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Received one delete request")
    // check auth
    token := r.Context().Value("user")
    claims := token.(*jwt.Token).Claims
    userIDFloat, ok := claims.(jwt.MapClaims)["userID"].(float64)
	productIDStr := mux.Vars(r)["productID"]
	
    if !ok {
        http.Error(w, "Invalid user ID", http.StatusInternalServerError)
        return
    }

    // 1. process data
    userID := int64(userIDFloat)
	productID, err := strconv.ParseInt(productIDStr, 10, 64)
    if err != nil {
        http.Error(w, "Invalid product ID provided", http.StatusBadRequest)
        return
    }

    // 2. call service level to delete product
    if err := service.DeleteProduct(productID, userID); err != nil {
        http.Error(w, "Failed to delete app from backend", http.StatusInternalServerError)
        return
    }

    // 3. response
    fmt.Fprintf(w, "Product deleted successfully\n")
}

func searchProductHandler(w http.ResponseWriter, r *http.Request) {
    // 1. process data
    // description here contains both product description and product title
	fmt.Println("Received one search request")
	w.Header().Set("Content-Type", "application/json")
	description := r.URL.Query().Get("description")
	batchStr := r.URL.Query().Get("batch")
	totalSizeStr := r.URL.Query().Get("totalSize")

	batch, err := strconv.Atoi(batchStr)
	if err != nil || batch < 1 {
		batch = 1 // default to first page
	}
	totalSize, err := strconv.Atoi(totalSizeStr)
	if err != nil || totalSize < 1 {
		totalSize = 50 // default total size to load from server
	}

	var products []model.Product

	// products, err = service.SearchProductsByTitle(title)
	// if err != nil {
	// 	http.Error(w, "Failed to read Apps from backend", http.StatusInternalServerError)
	// 	return
	// }
    
    // 2. call service to handle search
	products, err = service.SearchProductsByDescription(description, batch, totalSize)
	if err != nil {
		http.Error(w, "Failed to read Apps from backend", http.StatusInternalServerError)
		return
	}
    
    // 3. format json response
	js, err := json.Marshal(products)
	if err != nil {
		http.Error(w, "Failed to parse Apps into JSON format", http.StatusInternalServerError)
		return
	}
	w.Write(js)
}

func getProductHandler(w http.ResponseWriter, r *http.Request) {
    // TODO!!!
	fmt.Println("Received one get product request")

    token := r.Context().Value("user")
    claims := token.(*jwt.Token).Claims
    userIDFloat, ok := claims.(jwt.MapClaims)["userID"].(float64)
	productIDStr := mux.Vars(r)["productID"]
	
    if !ok {
        http.Error(w, "Invalid user ID", http.StatusInternalServerError)
        return
    }
    userID := int64(userIDFloat)
    // 1. process data
	productID, err := strconv.ParseInt(productIDStr, 10, 64)
    if err != nil {
        http.Error(w, "Invalid product ID provided", http.StatusBadRequest)
        return
    }

    // 2. call service level to get product info
    if err := service.DeleteProduct(productID, userID); err != nil {
        http.Error(w, "Failed to delete app from backend", http.StatusInternalServerError)
        return
    }

    // 3. format json response
    fmt.Fprintf(w, "Product deleted successfully\n")
}
