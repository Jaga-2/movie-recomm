import os
import json
import ast
import streamlit as st
import pandas as pd
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime

# Page Settings
st.set_page_config(
    page_title="CineMatch AI - Movie Recommendations",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==================== CUSTOM CSS STYLING ====================
st.markdown("""
<style>
    :root {
        --bg: #FFF8FB;
        --surface: #ffffff;
        --surface-2: #fff0f6;
        --text: #111827;
        --text-muted: #6b7280;
        --accent: #FF4F8B;
        --accent-strong: #9d174d;
        --accent-soft: #ffe4f0;
        --border: #FFD1DC;
        --shadow: 0 20px 50px rgba(255, 79, 139, 0.14);
    }

    * {
        transition: all 0.3s ease;
    }

    html, body, [data-testid="stAppViewContainer"] {
        background-color: var(--bg);
        color: var(--text);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #fff0f6 0%, #fde8f3 100%);
        border-right: 2px solid var(--accent);
        color: var(--text);
    }

    [data-testid="stMainBlockContainer"] {
        background-color: transparent;
        padding: 0 0 30px 0;
    }

    h1, h2, h3, h4, h5, h6 {
        color: var(--text);
        font-weight: 700;
    }

    .stButton > button {
        background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
        color: #fff;
        border: none;
        border-radius: 12px;
        font-weight: 700;
        padding: 14px 30px !important;
        font-size: 16px;
        box-shadow: 0 16px 40px rgba(219, 39, 119, 0.18);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .stButton > button:hover {
        box-shadow: 0 20px 50px rgba(219, 39, 119, 0.24);
        transform: translateY(-2px);
    }

    .stButton > button:active {
        transform: translateY(0);
    }

    .stSelectbox > div[data-baseweb="select"] > div,
    .stTextInput > div > input,
    .stTextArea > div > textarea {
        background-color: var(--surface-2);
        color: var(--text);
        border: 1px solid var(--border) !important;
        border-radius: 12px;
    }

    .stSelectbox > div[data-baseweb="select"] > div:hover,
    .stTextInput > div > input:hover,
    .stTextArea > div > textarea:hover {
        border-color: var(--accent) !important;
    }

    .movie-card,
    .recommendation-item,
    .metric-card,
    .expandable-section,
    .modal-shell,
    .stat-section,
    .footer {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 24px;
        box-shadow: var(--shadow);
    }

    .movie-card,
    .expandable-section,
    .stat-section,
    .modal-shell {
        padding: 24px;
        margin: 18px 0;
    }

    .metric-card {
        padding: 24px;
        text-align: center;
    }

    .metric-card:hover {
        transform: translateY(-4px);
    }

    .metric-value {
        font-size: 34px;
        font-weight: 700;
        color: var(--accent-strong);
        margin-bottom: 8px;
    }

    .metric-label {
        font-size: 13px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .hero-section {
        background: linear-gradient(135deg, #fff0f6 0%, #fde8f3 100%);
        border-radius: 28px;
        padding: 60px 40px;
        text-align: center;
        margin-bottom: 40px;
        border: 1px solid var(--border);
    }

    .hero-title {
        font-size: 54px;
        line-height: 1.05;
        margin-bottom: 18px;
        background: linear-gradient(135deg, #db2777 0%, #ec4899 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .hero-subtitle {
        font-size: 22px;
        color: var(--accent-strong);
        margin-bottom: 22px;
        font-weight: 500;
    }

    .hero-copy {
        color: var(--text-muted);
        font-size: 16px;
        line-height: 1.8;
        max-width: 860px;
        margin: 0 auto;
    }

    .search-container {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 22px;
        padding: 24px;
        margin-bottom: 32px;
    }

    .recommendations-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 22px;
        margin-top: 30px;
    }

    .recommendation-item {
        overflow: hidden;
        transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    }

    .recommendation-item:hover {
        transform: translateY(-8px);
        box-shadow: 0 24px 60px rgba(219, 39, 119, 0.14);
        border-color: var(--accent);
    }

    .poster-frame {
        position: relative;
        width: 100%;
        aspect-ratio: 2 / 3;
        background: linear-gradient(135deg, var(--surface-2), #fde8f3);
        border-bottom: 1px solid var(--border);
        overflow: hidden;
    }

    .poster-frame::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(255,255,255,0.12), rgba(219,39,119,0.08));
        pointer-events: none;
    }

    .poster-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .trending-card {
        background: #ffffff;
        border: 1px solid #FFD1DC;
        border-radius: 24px;
        box-shadow: 0 16px 30px rgba(255, 79, 139, 0.12);
        padding: 22px;
        margin-bottom: 22px;
        transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    .trending-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 24px 45px rgba(255, 79, 139, 0.18);
    }

    .trending-card-inner {
        display: flex;
        gap: 24px;
        align-items: flex-start;
    }

    .trending-poster {
        min-width: 180px;
        max-width: 220px;
        width: 100%;
        border-radius: 15px;
        overflow: hidden;
        flex-shrink: 0;
    }

    .trending-poster img {
        border-radius: 15px;
        box-shadow: 0 16px 30px rgba(0, 0, 0, 0.12);
        transition: transform 0.3s ease;
    }

    .trending-card:hover .trending-poster img {
        transform: scale(1.03);
    }

    .trending-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .trending-title {
        font-size: 24px;
        font-weight: 700;
        color: var(--text);
        margin-bottom: 10px;
    }

    .trending-meta,
    .trending-release {
        color: var(--text-muted);
        font-size: 14px;
        margin-bottom: 8px;
    }

    .trending-genres {
        font-size: 13px;
        color: var(--accent-strong);
        margin-bottom: 14px;
    }

    .trending-overview {
        color: #4b5563;
        font-size: 14px;
        line-height: 1.6;
        max-height: 4.8em;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        margin-bottom: 16px;
    }

    .trending-details-button {
        display: inline-block;
        background: #FF4F8B;
        color: #ffffff;
        border: none;
        border-radius: 16px;
        padding: 14px 26px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.7px;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        box-shadow: 0 12px 25px rgba(255, 79, 139, 0.2);
        text-align: center;
    }

    .trending-details-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 16px 28px rgba(255, 79, 139, 0.24);
    }

    @media (max-width: 820px) {
        .trending-card-inner {
            flex-direction: column;
        }

        .trending-poster {
            max-width: 100%;
        }
    }

    .poster-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 22px;
        text-align: center;
        color: var(--text-muted);
        background: linear-gradient(135deg, #fff0f6 0%, #fde8f3 100%);
    }

    .recommendation-content {
        padding: 20px;
    }

    .recommendation-title {
        font-size: 18px;
        font-weight: 700;
        color: var(--text);
        margin-bottom: 10px;
    }

    .recommendation-meta {
        font-size: 13px;
        color: var(--text-muted);
        margin-bottom: 10px;
    }

    .recommendation-rating {
        border-top: 1px solid var(--border);
        margin-top: 12px;
        padding-top: 12px;
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
    }

    .rating-badge,
    .match-badge {
        display: inline-block;
        background: var(--accent-soft);
        color: var(--accent-strong);
        padding: 8px 14px;
        border-radius: 999px;
        font-weight: 700;
        font-size: 12px;
    }

    .sidebar-title {
        color: var(--accent-strong);
        font-size: 20px;
        font-weight: 700;
        margin: 20px 0 15px 0;
        padding-bottom: 10px;
        border-bottom: 2px solid var(--border);
    }

    .sidebar-link {
        color: var(--text);
        padding: 12px;
        border-radius: 12px;
        margin-bottom: 8px;
        transition: all 0.2s ease;
        display: block;
        text-decoration: none;
    }

    .sidebar-link:hover {
        background-color: var(--accent-soft);
        color: var(--accent-strong);
        padding-left: 16px;
    }

    .footer {
        background: var(--surface);
        border-top: 1px solid var(--border);
        padding: 30px;
        margin-top: 50px;
        text-align: center;
        color: var(--text-muted);
        font-size: 14px;
    }

    .footer-link {
        color: var(--accent-strong);
        text-decoration: none;
        margin: 0 10px;
        transition: all 0.2s ease;
    }

    .footer-link:hover {
        color: var(--accent);
        text-decoration: underline;
    }

    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }

    .loading-spinner {
        animation: pulse 1.5s ease-in-out infinite;
        color: var(--accent);
        font-size: 48px;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .fade-in {
        animation: fadeIn 0.5s ease-out;
    }

    .stTabs [data-baseweb="tab-list"] button {
        background-color: transparent;
        color: var(--text);
        border-bottom: 2px solid var(--border);
    }

    .stTabs [aria-selected="true"] {
        border-bottom-color: var(--accent) !important;
        color: var(--accent-strong) !important;
    }

    ::-webkit-scrollbar {
        width: 10px;
    }

    ::-webkit-scrollbar-track {
        background: var(--surface);
    }

    ::-webkit-scrollbar-thumb {
        background: var(--accent);
        border-radius: 5px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #ec4899;
    }

    .expandable-section {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 24px;
        margin: 15px 0;
    }

    .genre-tag {
        display: inline-block;
        background: var(--surface-2);
        color: var(--accent-strong);
        padding: 6px 10px;
        border-radius: 999px;
        margin: 4px 6px 0 0;
        font-size: 12px;
    }

    .gallery-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 18px;
        align-items: stretch;
    }

    .modal-shell {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 24px;
        box-shadow: var(--shadow);
        margin-bottom: 20px;
    }

    .modal-title {
        font-size: 24px;
        font-weight: 700;
        color: var(--accent-strong);
        margin-bottom: 8px;
    }

    .modal-meta {
        color: var(--text-muted);
        margin-bottom: 10px;
    }

    .modal-copy {
        color: var(--text);
        line-height: 1.7;
    }

    @media (max-width: 768px) {
        .hero-title {
            font-size: 36px;
        }

        .hero-subtitle {
            font-size: 18px;
        }

        .recommendations-grid {
            grid-template-columns: 1fr;
        }

        .metric-card {
            margin-bottom: 15px;
        }
    }
</style>
""", unsafe_allow_html=True)

# ==================== SESSION STATE INITIALIZATION ====================
if 'favorites' not in st.session_state:
    st.session_state.favorites = []
if 'recently_viewed' not in st.session_state:
    st.session_state.recently_viewed = []
if 'recommendation_count' not in st.session_state:
    st.session_state.recommendation_count = 0
if 'theme' not in st.session_state:
    st.session_state.theme = 'dark'

# ==================== LOAD DATASET ====================
BASE_DIR = Path(__file__).resolve().parent


def find_data_file():
    for candidate in [BASE_DIR / "tmdb_5000_movies.csv", BASE_DIR / "movie.csv", BASE_DIR / "movies.csv"]:
        if candidate.exists():
            return candidate
    raise FileNotFoundError("No movie dataset file was found in the project directory.")


@st.cache_data(show_spinner=False)
def get_poster_url(movie):
    if not isinstance(movie, dict):
        return None

    for key in ("poster_url", "poster", "poster_path", "image_url"):
        value = movie.get(key)
        if isinstance(value, str) and value:
            if value.startswith("http"):
                return value
            if value.startswith("/"):
                return f"https://image.tmdb.org/t/p/w500{value}"

    api_key = os.getenv("TMDB_API_KEY", "").strip()
    movie_id = movie.get("id")
    movie_title = movie.get("title") or movie.get("original_title") or ""

    if movie_id and api_key:
        try:
            req = Request(
                f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={api_key}",
                headers={"User-Agent": "Mozilla/5.0"},
            )
            with urlopen(req, timeout=8) as response:
                payload = json.load(response)
                poster_path = payload.get("poster_path")
                if poster_path:
                    return f"https://image.tmdb.org/t/p/w500{poster_path}"
        except Exception:
            pass

    if movie_title:
        placeholder_text = quote(movie_title[:30])
        return f"https://via.placeholder.com/220x330/ffe4f0/9d174d?text={placeholder_text}"

    return None


def get_poster_html(movie, alt_text="Movie poster"):
    poster_url = get_poster_url(movie)
    fallback_svg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='750' viewBox='0 0 500 750'%3E%3Crect width='500' height='750' fill='%23F1F3F5'/%3E%3Crect x='70' y='70' width='360' height='610' rx='24' fill='%23E9ECEF'/%3E%3Cpath d='M180 260h140' stroke='%233E5C4B' stroke-width='10' stroke-linecap='round'/%3E%3Cpath d='M185 325h130' stroke='%233E5C4B' stroke-width='10' stroke-linecap='round'/%3E%3Ccircle cx='250' cy='420' r='48' fill='%233E5C4B'/%3E%3C/svg%3E"

    if poster_url:
        return f"<img src='{poster_url}' alt='{alt_text}' class='poster-image' onerror=\"this.onerror=null;this.src='{fallback_svg}';\" />"

    return f"<div class='poster-fallback'>No poster available</div>"


@st.cache_data
def load_data():
    data_file = find_data_file()
    movies = pd.read_csv(data_file)
    movies = movies.copy()
    movies['title'] = movies['title'].fillna('Untitled')
    movies['overview'] = movies['overview'].fillna('').astype(str)
    movies['genres'] = movies['genres'].fillna('[]').astype(str)
    movies['tags'] = movies['overview'] + " " + movies['genres']
    return movies

movies = load_data()

# ==================== RECOMMENDATION LOGIC ====================
@st.cache_resource
def build_similarity_matrix():
    tfidf = TfidfVectorizer(stop_words='english', max_features=5000)
    vectors = tfidf.fit_transform(movies['tags'])
    similarity = cosine_similarity(vectors)
    return similarity

similarity = build_similarity_matrix()

def recommend(movie_name, num_recommendations=10):
    """Generate recommendations with match scores"""
    try:
        movie_index = movies[movies['title'] == movie_name].index[0]
        distances = similarity[movie_index]
        movie_list = sorted(
            list(enumerate(distances)),
            reverse=True,
            key=lambda x: x[1]
        )[1:num_recommendations+1]
        
        recommendations = []
        for idx, (i, score) in enumerate(movie_list):
            movie_data = movies.iloc[i].to_dict()
            movie_data['match_score'] = score
            movie_data['match_percentage'] = int(score * 100)
            recommendations.append(movie_data)
        
        return recommendations
    except:
        return []

def get_genres(genres_str):
    """Parse genres from JSON string"""
    try:
        genres = json.loads(genres_str)
        return [g['name'] for g in genres]
    except:
        return []

def get_release_year(date_str):
    """Extract year from date string"""
    try:
        return str(date_str).split('-')[0]
    except:
        return "N/A"

def get_statistics():
    """Calculate dashboard statistics"""
    total_movies = len(movies)
    
    all_genres = []
    for genres_str in movies['genres']:
        all_genres.extend(get_genres(genres_str))
    
    unique_genres = len(set(all_genres))
    most_common_genre = max(set(all_genres), key=all_genres.count) if all_genres else "N/A"
    
    return {
        'total_movies': total_movies,
        'genres_available': unique_genres,
        'most_popular_genre': most_common_genre,
        'recommendations_made': st.session_state.recommendation_count
    }


def get_movie_title(movie):
    if not isinstance(movie, dict):
        return "Untitled"
    return str(movie.get("title") or movie.get("original_title") or "Untitled")


def open_movie_details(movie):
    if not movie:
        return
    st.session_state.active_movie = movie
    st.session_state.active_movie_title = get_movie_title(movie)
    st.rerun()


def close_movie_details():
    st.session_state.pop("active_movie", None)
    st.session_state.pop("active_movie_title", None)
    st.rerun()


def render_movie_detail_modal(movie):
    if not movie:
        return

    movie_title = get_movie_title(movie)
    overview = str(movie.get("overview") or "No overview available for this film.")
    release_year = get_release_year(movie.get("release_date", "N/A"))
    vote_average = movie.get("vote_average", 0)
    genres = get_genres(movie.get("genres", "[]"))

    if hasattr(st, "dialog"):
        @st.dialog(f"{movie_title} details")
        def _modal():
            st.markdown(f"""
            <div class="modal-shell">
                <div class="modal-title">{movie_title}</div>
                <div class="modal-meta">Released {release_year} · Rating {vote_average:.1f}/10</div>
                <div class="modal-copy">{overview[:700]}</div>
                <div style='margin-top: 12px;'>
                    {''.join([f'<span class="genre-tag">{genre}</span>' for genre in genres[:5]])}
                </div>
            </div>
            """, unsafe_allow_html=True)
            if st.button("Close details"):
                close_movie_details()

        _modal()
    else:
        st.markdown(f"""
        <div class="modal-shell">
            <div class="modal-title">{movie_title}</div>
            <div class="modal-meta">Released {release_year} · Rating {vote_average:.1f}/10</div>
            <div class="modal-copy">{overview[:700]}</div>
            <div style='margin-top: 12px;'>
                {''.join([f'<span class="genre-tag">{genre}</span>' for genre in genres[:5]])}
            </div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Close details", key=f"close_modal_{movie_title}"):
            close_movie_details()

# ==================== SIDEBAR NAVIGATION ====================
with st.sidebar:
    st.markdown("""
    <div style='text-align: center; padding: 20px 0;'>
        <h1 style='color: var(--accent-strong); margin: 0;'>CineMatch</h1>
        <p style='color: var(--text-muted); margin: 5px 0 0 0;'>Thoughtful film recommendations</p>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
    
    st.markdown('<h3 class="sidebar-title">📱 Navigation</h3>', unsafe_allow_html=True)
    page = st.radio(
        "Choose a section:",
        ["🏠 Home", "🎯 Get Recommendations", "🔥 Trending", "💖 Favorites", 
         "👁️ Recently Viewed", "ℹ️ About", "📧 Contact"],
        label_visibility="collapsed"
    )
    
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
    
    st.markdown('<h3 class="sidebar-title">⚙️ Settings</h3>', unsafe_allow_html=True)
    num_recommendations = st.slider("Recommendations to show:", 5, 20, 10)
    
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
    
    st.markdown('<h3 class="sidebar-title">📊 Quick Stats</h3>', unsafe_allow_html=True)
    stats = get_statistics()
    col1, col2 = st.columns(2)
    with col1:
        st.metric("Total Movies", stats['total_movies'])
    with col2:
        st.metric("Genres", stats['genres_available'])

if "active_movie" in st.session_state and st.session_state.get("active_movie"):
    render_movie_detail_modal(st.session_state.active_movie)

# ==================== HOME PAGE ====================
if page == "🏠 Home":
    # Hero Section
    st.markdown("""
    <div class="hero-section">
        <div class="hero-title">CineMatch AI</div>
        <div class="hero-subtitle">Discover your next favorite film with thoughtful recommendations.</div>
        <p class='hero-copy'>
            Curated suggestions based on plot, genre, and audience appeal.
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # Statistics Dashboard
    st.markdown('<h2 style="color: var(--accent-strong); margin-top: 40px;">📈 Platform Statistics</h2>', unsafe_allow_html=True)
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-value">{stats['total_movies']}</div>
            <div class="metric-label">Total Movies</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-value">{stats['genres_available']}</div>
            <div class="metric-label">Genres</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-value">{stats['most_popular_genre']}</div>
            <div class="metric-label">Top Genre</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-value">{stats['recommendations_made']}</div>
            <div class="metric-label">Recommendations Made</div>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
    
    # Trending Section Preview
    st.markdown('<h2 style="margin-top: 30px;">Top rated films</h2>', unsafe_allow_html=True)
    
    top_movies = movies.nlargest(5, 'vote_average')
    st.markdown('<div class="gallery-grid">', unsafe_allow_html=True)
    
    for idx, (_, movie) in enumerate(top_movies.iterrows()):
        movie_data = movie.to_dict() if hasattr(movie, 'to_dict') else dict(movie)
        poster_html = get_poster_html(movie_data, movie_data.get('title', 'Movie poster'))
        st.markdown(f"""
        <div class="recommendation-item" style='cursor: pointer;'>
            <div class="poster-frame">{poster_html}</div>
            <div class="recommendation-content">
                <div class="recommendation-title">{movie_data['title'][:24]}{'...' if len(str(movie_data['title'])) > 24 else ''}</div>
                <div class="recommendation-meta">{get_release_year(movie_data.get('release_date', 'N/A'))}</div>
                <div class="rating-badge">⭐ {movie_data.get('vote_average', 0):.1f}/10</div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("View details", key=f"home_detail_{idx}", use_container_width=True):
            open_movie_details(movie_data)
    st.markdown('</div>', unsafe_allow_html=True)

# ==================== RECOMMENDATIONS PAGE ====================
elif page == "🎯 Get Recommendations":
    st.markdown('<h2>Find your next favorite film</h2>', unsafe_allow_html=True)
    
    st.markdown("""
    <div class="search-container">
    """, unsafe_allow_html=True)
    
    col1, col2 = st.columns([3, 1])
    
    with col1:
        selected_movie = st.selectbox(
            "🔍 Search for a movie",
            movies['title'].values,
            label_visibility="collapsed",
            key="movie_select"
        )
    
    with col2:
        search_button = st.button("🔎 Recommend", use_container_width=True)
    
    st.markdown("</div>", unsafe_allow_html=True)
    
    if search_button:
        with st.spinner("🎬 Finding perfect matches..."):
            recommendations = recommend(selected_movie, num_recommendations)
            st.session_state.recommendation_count += 1
            st.session_state.recently_viewed.insert(0, selected_movie)
            st.session_state.recently_viewed = st.session_state.recently_viewed[:10]
    
    if 'recommendations' in locals() and recommendations:
        st.markdown(f"<h3 style='color: var(--accent-strong);'>Top {len(recommendations)} recommendations</h3>", unsafe_allow_html=True)
        
        for idx, movie in enumerate(recommendations, 1):
            with st.container():
                col1, col2 = st.columns([1, 3])
                
                with col1:
                    st.markdown(f"""
                    <div style='
                        background: linear-gradient(135deg, #f9a8d4 0%, #fb7185 100%);
                        border-radius: 12px;
                        padding: 15px;
                        text-align: center;
                        color: white;
                        font-weight: 700;
                        font-size: 20px;
                    '>
                        #{idx}
                    </div>
                    """, unsafe_allow_html=True)
                
                with col2:
                    st.markdown(f"""
                    <div class="expandable-section">
                        <div class="recommendation-title" style='font-size: 24px; color: var(--text);'>{movie['title']}</div>
                        <div class="recommendation-meta" style='margin-bottom: 10px;'>
                            Released {get_release_year(movie.get('release_date', 'N/A'))} ·
                            Rating {movie.get('vote_average', 0):.1f}/10
                        </div>
                        <div style='margin: 10px 0;'>
                            <span class="match-badge">Match {movie['match_percentage']}%</span>
                        </div>
                        <div style='color: var(--text-muted); font-size: 14px; line-height: 1.6;'>
                            {movie.get('overview', 'No overview available.')[:300]}...
                        </div>
                        <div style='margin-top: 10px;'>
                    """, unsafe_allow_html=True)
                    
                    genres = get_genres(movie.get('genres', '[]'))
                    for genre in genres[:3]:
                        st.markdown(f'<span class="genre-tag">{genre}</span>', unsafe_allow_html=True)
                    
                    st.markdown("</div></div>", unsafe_allow_html=True)
                    
                    # Add to favorites button
                    if st.button(f"Add to favorites", key=f"fav_{idx}"):
                        if movie['title'] not in st.session_state.favorites:
                            st.session_state.favorites.append(movie['title'])
                            st.success(f"Added '{movie['title']}' to favorites!")

# ==================== TRENDING PAGE ====================
elif page == "🔥 Trending":
    st.markdown('<h2>Trending and popular films</h2>', unsafe_allow_html=True)
    
    tab1, tab2, tab3 = st.tabs(["📈 Top Rated", "🎯 Most Popular", "🆕 Most Recent"])
    
    def render_trending_movies(movie_list, category_key):
        for idx, (_, movie) in enumerate(movie_list.iterrows()):
            movie_data = movie.to_dict() if hasattr(movie, 'to_dict') else dict(movie)
            poster_url = get_poster_url(movie_data)
            overview = str(movie_data.get('overview', 'No overview available.')).strip()
            short_overview = overview if len(overview) <= 240 else overview[:237].rsplit(' ', 1)[0] + '...'
            genres = get_genres(movie_data.get('genres', '[]'))

            with st.container():
                with st.spinner("Loading trending posters..."):
                    card_col1, card_col2 = st.columns([1, 2], gap="large")
                    with card_col1:
                        if poster_url:
                            st.image(
                                poster_url,
                                width=220,
                                caption=None,
                            )
                        else:
                            st.markdown(
                                """
                                <div class='poster-fallback' style='width:210px; height:315px; border-radius:15px;'>
                                    No Poster Available
                                </div>
                                """,
                                unsafe_allow_html=True,
                            )
                    with card_col2:
                        st.markdown(f"""
                        <div class='trending-card'>
                            <div class='trending-card-inner'>
                                <div class='trending-info'>
                                    <div>
                                        <div class='trending-title'>{movie_data.get('title', 'Untitled')}</div>
                                        <div class='trending-meta'>⭐ {movie_data.get('vote_average', 0):.1f} · {get_release_year(movie_data.get('release_date', 'N/A'))}</div>
                                        <div class='trending-genres'>{' • '.join(genres[:4]) or 'Genre unavailable'}</div>
                                        <div class='trending-overview'>{short_overview}</div>
                                        <div class='trending-release'>Release: {movie_data.get('release_date', 'N/A')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)
                        if st.button("View Details", key=f"{category_key}_detail_{idx}", use_container_width=True):
                            open_movie_details(movie_data)

    with tab1:
        st.markdown('<h3>Highest rated films</h3>', unsafe_allow_html=True)
        top_movies = movies.nlargest(12, 'vote_average')
        render_trending_movies(top_movies, 'top')
    
    with tab2:
        st.markdown('<h3>Most popular films</h3>', unsafe_allow_html=True)
        pop_movies = movies.nlargest(12, 'popularity')
        render_trending_movies(pop_movies, 'pop')
    
    with tab3:
        st.markdown('<h3>Most recent films</h3>', unsafe_allow_html=True)
        recent_movies = movies.sort_values('release_date', ascending=False).head(12)
        render_trending_movies(recent_movies, 'recent')

# ==================== FAVORITES PAGE ====================
elif page == "💖 Favorites":
    st.markdown('<h2>Your favorite films</h2>', unsafe_allow_html=True)
    
    if st.session_state.favorites:
        st.markdown(f"<p style='color: var(--accent-strong);'>You have {len(st.session_state.favorites)} favorite film(s)</p>", unsafe_allow_html=True)
        
        cols = st.columns(3)
        for idx, title in enumerate(st.session_state.favorites):
            with cols[idx % 3]:
                try:
                    movie = movies[movies['title'] == title].iloc[0]
                    poster_html = get_poster_html(movie, movie.get('title', 'Movie poster'))
                    st.markdown(f"""
                    <div class="recommendation-item">
                        <div class="poster-frame">{poster_html}</div>
                        <div class="recommendation-content">
                            <div class="recommendation-title">{movie['title']}</div>
                            <div class="recommendation-meta">{get_release_year(movie.get('release_date', 'N/A'))}</div>
                            <div class="recommendation-rating">
                                <span class="rating-badge">⭐ {movie.get('vote_average', 0):.1f}</span>
                            </div>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)

                    if st.button("View details", key=f"fav_detail_{idx}", use_container_width=True):
                        open_movie_details(movie.to_dict())
                    
                    if st.button(f"Remove from Favorites", key=f"remove_fav_{idx}"):
                        st.session_state.favorites.remove(title)
                        st.rerun()
                except:
                    pass
    else:
        st.markdown("""
        <div class="hero-section">
            <div style='font-size: 48px; margin-bottom: 20px;'>💭</div>
            <div style='color: var(--text);'>No favorites yet.</div>
            <div style='color: var(--text-muted); margin-top: 10px;'>Start adding your favorite movies to see them here.</div>
        </div>
        """, unsafe_allow_html=True)

# ==================== RECENTLY VIEWED PAGE ====================
elif page == "👁️ Recently Viewed":
    st.markdown('<h2>Recently viewed</h2>', unsafe_allow_html=True)
    
    if st.session_state.recently_viewed:
        st.markdown(f"<p style='color: var(--accent-strong);'>You viewed {len(st.session_state.recently_viewed)} film(s)</p>", unsafe_allow_html=True)
        
        for idx, title in enumerate(st.session_state.recently_viewed):
            try:
                movie = movies[movies['title'] == title].iloc[0]
                with st.container():
                    col1, col2 = st.columns([1, 3])
                    
                    with col1:
                        st.markdown(f"""
                        <div style='
                            background: var(--surface-2);
                            border-radius: 12px;
                            padding: 12px;
                            text-align: center;
                            color: var(--accent-strong);
                            font-weight: 700;
                            font-size: 20px;
                        '>
                            #{idx+1}
                        </div>
                        """, unsafe_allow_html=True)
                    
                    with col2:
                        st.markdown(f"""
                        <div class="expandable-section">
                            <div class="recommendation-title">{movie['title']}</div>
                            <div class="recommendation-meta">⭐ {movie.get('vote_average', 0):.1f}/10</div>
                            <div style='color: var(--text-muted); font-size: 14px;'>
                                {movie.get('overview', 'No overview available.')[:200]}...
                            </div>
                        </div>
                        """, unsafe_allow_html=True)
            except:
                pass
    else:
        st.markdown("""
        <div class="hero-section">
            <div style='font-size: 48px; margin-bottom: 20px;'>🔭</div>
            <div style='color: var(--text);'>No viewing history yet.</div>
            <div style='color: var(--text-muted); margin-top: 10px;'>Movies you search for will appear here.</div>
        </div>
        """, unsafe_allow_html=True)

# ==================== ABOUT PAGE ====================
elif page == "ℹ️ About":
    st.markdown("""
    <div class="hero-section">
        <div class="hero-title">About CineMatch AI</div>
        <div class="hero-subtitle">Thoughtful movie recommendations in a clear and elegant experience.</div>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown(f"""
        <div class="stat-section">
            <h3 style='color: var(--accent-strong);'>Platform statistics</h3>
            <ul style='color: var(--text-muted); list-style: none; padding: 0;'>
                <li>✓ {stats['total_movies']} films in the database</li>
                <li>✓ {stats['genres_available']} genres available</li>
                <li>✓ Smart recommendations powered by content similarity</li>
                <li>✓ Clear and polished browsing experience</li>
                <li>✓ {stats['recommendations_made']} recommendations generated</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="stat-section">
            <h3 style='color: var(--accent-strong);'>Features</h3>
            <ul style='color: var(--text-muted); list-style: none; padding: 0;'>
                <li>✦ Smart movie recommendations</li>
                <li>✦ Trending film discovery</li>
                <li>✦ Favorites management</li>
                <li>✦ Viewing history tracking</li>
                <li>✦ Clean and responsive interface</li>
                <li>✦ Poster-led browsing experience</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("""
    <div class="stat-section" style='margin-top: 30px;'>
        <h3 style='color: var(--accent-strong);'>How it works</h3>
        <p style='color: var(--text-muted); line-height: 1.8;'>
            CineMatch AI uses a simple recommendation approach to suggest films based on:
        </p>
        <ol style='color: var(--text-muted); line-height: 1.8;'>
            <li><strong>Content-based filtering:</strong> Reviews film descriptions and genres</li>
            <li><strong>TF-IDF vectorization:</strong> Converts text into numerical features</li>
            <li><strong>Cosine similarity:</strong> Measures how closely films relate to one another</li>
            <li><strong>Smart ranking:</strong> Prioritizes recommendations by match percentage</li>
        </ol>
    </div>
    """, unsafe_allow_html=True)

# ==================== CONTACT PAGE ====================
elif page == "📧 Contact":
    st.markdown("""
    <div class="hero-section">
        <div class="hero-title">Get in touch</div>
        <div class="hero-subtitle">Share your feedback or suggestions.</div>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("""
        <div class="stat-section">
            <h3 style='color: var(--accent-strong);'>Contact information</h3>
            <p style='color: var(--text);'>
                <strong>Email:</strong><br>
                <a href='mailto:mjaga222@gmail.com' class='footer-link'>mjaga222@gmail.com</a>
            </p>
            <p style='color: var(--text);'>
                <strong>GitHub:</strong><br>
                <a href='https://github.com' class='footer-link' target='_blank'>GitHub Profile</a>
            </p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="stat-section">
            <h3 style='color: var(--accent-strong);'>Send feedback</h3>
            <p style='color: var(--text);'>
                Have suggestions for improvements? <br>
                We'd love to hear from you!
            </p>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown('<div style="height: 30px;"></div>', unsafe_allow_html=True)
    
    with st.form("contact_form"):
        name = st.text_input("Your Name", placeholder="Enter your name")
        email = st.text_input("Your Email", placeholder="Enter your email")
        message = st.text_area("Message", placeholder="Your message here...", height=150)
        submitted = st.form_submit_button("Send Message", use_container_width=True)
        
        if submitted and name and email and message:
            st.success("Thank you for your message. We will get back to you soon.")

# ==================== FOOTER ====================
st.markdown("""
<div class="footer">
    <div style='margin-bottom: 15px;'>
        <strong>CineMatch AI - thoughtful movie recommendations</strong>
    </div>
    <div>
        <a href='mailto:mjaga222@gmail.com' class='footer-link'>Contact</a> • 
        <a href='https://github.com' class='footer-link' target='_blank'>GitHub</a> • 
        <a href='https://www.themoviedb.org/' class='footer-link' target='_blank'>TMDB</a>
    </div>
    <div style='margin-top: 15px; color: var(--text-muted);'>
        © 2026 CineMatch AI. All rights reserved. | 
        Developed by Jagatheeswari Manikandan | 
        Data powered by TMDB
    </div>
</div>
""", unsafe_allow_html=True)
