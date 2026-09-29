# 🎬 Movie Recommender

A movie recommendation system built with Python and the TMDB 5000 Movies dataset. Pick a movie you like and get a list of similar titles.

## 🌟 Features

- **Content-based recommendations**: suggests movies with similar genres, keywords, cast and overview text
- **TMDB 5000 dataset**: metadata for about 5,000 movies (`tmdb_5000_movies.csv`)
- **Web interface**: search for a movie and view recommendations
- **Modular structure**: separate backend, frontend and tests

## 📂 Project Structure

```
movie-recomm/
├── backend/                  # Recommendation logic & API
├── frontend/                 # User interface
├── tests/                    # Test suite
├── app.py                    # Application entrypoint
├── movie.csv                 # Movie data
├── tmdb_5000_movies.csv      # TMDB dataset
├── requirements.txt          # Python dependencies
├── LICENSE
└── README.md
```

## 🚀 Getting Started

1. **Clone the repository**
```bash
   git clone https://github.com/Jaga-2/movie-recomm.git
   cd movie-recomm
```

2. **Create a virtual environment** (optional)
```bash
   python -m venv .venv
   # Windows
   .\.venv\Scripts\activate
   # macOS/Linux
   source .venv/bin/activate
```

3. **Install dependencies**
```bash
   pip install -r requirements.txt
```

4. **Run the app**
```bash
   python app.py
```

## 🛠️ How It Works

1. Load and clean the movie data (genres, keywords, overview)
2. Combine the text features into one "tags" field per movie
3. Vectorize the text (e.g. TF-IDF or CountVectorizer)
4. Compute cosine similarity between movies
5. Return the top N most similar movies for a chosen title

## 🧪 Tests

```bash
pytest tests/
```

## 📄 License

Released under the [MIT License](LICENSE).

## 🙏 Acknowledgements

- [TMDB 5000 Movie Dataset](https://www.kaggle.com/datasets/tmdb/tmdb-movie-metadata)
