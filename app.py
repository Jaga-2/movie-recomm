import streamlit as st
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Page Settings
st.set_page_config(
    page_title="Movie Recommendation System",
    page_icon="🎬",
    layout="wide"
)

# Title
st.markdown(
    "<h1 style='text-align:center;'>🎬 Movie Recommendation System</h1>",
    unsafe_allow_html=True
)

# Load Dataset
movies = pd.read_csv("tmdb_5000_movies.csv")

# Fill missing values
movies['overview'] = movies['overview'].fillna('')
movies['genres'] = movies['genres'].fillna('')

# Create text for similarity
movies['tags'] = movies['overview'] + " " + movies['genres']

# TF-IDF Vectorization
tfidf = TfidfVectorizer(stop_words='english')

vectors = tfidf.fit_transform(movies['tags'])

# Similarity Matrix
similarity = cosine_similarity(vectors)

# Recommendation Function
def recommend(movie_name):

    movie_index = movies[movies['title'] == movie_name].index[0]

    distances = similarity[movie_index]

    movie_list = sorted(
        list(enumerate(distances)),
        reverse=True,
        key=lambda x: x[1]
    )[1:6]

    recommendations = []

    for i in movie_list:
        recommendations.append(movies.iloc[i[0]])

    return recommendations


# Search Movie
selected_movie = st.selectbox(
    "Search a Movie",
    movies['title'].values
)

if st.button("Recommend Movies"):

    recommended_movies = recommend(selected_movie)

    st.subheader("Top Recommendations")

    for movie in recommended_movies:

        with st.container():

            st.markdown("---")

            st.write("###", movie['title'])

            if 'vote_average' in movies.columns:
                st.write("⭐ Rating:", movie['vote_average'])

            if 'overview' in movies.columns:
                st.write(movie['overview'])
