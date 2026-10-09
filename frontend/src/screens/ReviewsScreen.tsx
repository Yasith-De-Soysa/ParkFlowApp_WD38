import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

type Review = {
  _id: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export default function ReviewsScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: { params: { facilityId: string; facilityName: string } };
}) {
  const { facilityId, facilityName } = route.params;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    try {
      const response = await api.getFacilityReviews(facilityId);
      setReviews(response.reviews);
      setAverage(response.ratingAverage);
      setCount(response.ratingCount);
    } catch (error) {
      console.error('Unable to load facility reviews:', error);
      Alert.alert('Unable to load reviews', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, [facilityId]);

  useEffect(() => {
    void loadReviews();
    void api.getCurrentUser()
      .then((response) => setCurrentUserId(response.user?._id || response.user?.id || ''))
      .catch((error) => console.error('Unable to load current user for review editing:', error));
  }, [loadReviews]);

  const saveReview = async () => {
    if (!rating || !comment.trim()) {
      Alert.alert('Incomplete review', 'Choose a star rating and write a review.');
      return;
    }
    setPosting(true);
    try {
      const response = editingReviewId
        ? await api.updateFacilityReview(facilityId, editingReviewId, { rating, comment: comment.trim() })
        : await api.addFacilityReview(facilityId, { rating, comment: comment.trim() });
      setReviews((current) => editingReviewId
        ? current.map((review) => review._id === editingReviewId ? response.review : review)
        : [response.review, ...current]);
      setAverage(response.ratingAverage);
      setCount(response.ratingCount);
      setRating(0);
      setComment('');
      setEditingReviewId(null);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error?.message || 'Unable to post your review.'
        : 'Unable to post your review.';
      Alert.alert('Review failed', message);
    } finally {
      setPosting(false);
    }
  };

  const beginEditing = (review: Review) => {
    if (!currentUserId || String(review.reviewerId) !== String(currentUserId)) {
      return;
    }
    setEditingReviewId(review._id);
    setRating(review.rating);
    setComment(review.comment);
  };

  const deleteReview = (review: Review) => {
    if (!currentUserId || String(review.reviewerId) !== String(currentUserId) || deletingReviewId) {
      return;
    }

    Alert.alert('Delete review?', 'This review and rating will be permanently removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setDeletingReviewId(review._id);
            try {
              const response = await api.deleteFacilityReview(facilityId, review._id);
              setReviews((current) => current.filter((item) => item._id !== review._id));
              setAverage(response.ratingAverage);
              setCount(response.ratingCount);
              if (editingReviewId === review._id) {
                setEditingReviewId(null);
                setRating(0);
                setComment('');
              }
            } catch (error) {
              const message = axios.isAxiosError(error)
                ? error.response?.data?.error?.message || 'Unable to delete your review.'
                : 'Unable to delete your review.';
              Alert.alert('Delete failed', message);
            } finally {
              setDeletingReviewId(null);
            }
          })();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Reviews & Ratings</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{facilityName}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.average}>{average ? average.toFixed(1) : '—'}</Text>
          <View>
            <Text style={styles.stars}>{renderStars(Math.round(average))}</Text>
            <Text style={styles.basedOn}>Based on {count} {count === 1 ? 'review' : 'reviews'}</Text>
          </View>
        </View>

        <View style={styles.reviewCard}>
          <Text style={styles.cardTitle}>{editingReviewId ? 'Edit your review' : 'Leave a review'}</Text>
          <View style={styles.ratingPicker}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable key={value} onPress={() => setRating(value)} accessibilityLabel={`${value} stars`}>
                <Text style={styles.pickStar}>{value <= rating ? '★' : '☆'}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            multiline
            value={comment}
            onChangeText={setComment}
            placeholder="Share your parking experience..."
            placeholderTextColor="#66736f"
            style={styles.commentInput}
            maxLength={500}
          />
          <Pressable style={[styles.postButton, posting && styles.disabled]} onPress={() => void saveReview()} disabled={posting}>
            <Text style={styles.postButtonText}>{posting ? 'Saving…' : editingReviewId ? 'Update Review' : 'Post Review'}</Text>
          </Pressable>
          {editingReviewId && (
            <Pressable onPress={() => { setEditingReviewId(null); setRating(0); setComment(''); }}>
              <Text style={styles.cancelEdit}>Cancel editing</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.recentTitle}>Recent comments</Text>
        {loading ? (
          <ActivityIndicator color="#176b58" />
        ) : reviews.length === 0 ? (
          <Text style={styles.empty}>No reviews yet. Be the first to share your experience.</Text>
        ) : (
          reviews.map((review) => (
            <View style={styles.commentCard} key={review._id}>
              <View style={styles.commentHeader}>
                <Text style={styles.reviewer}>{review.reviewerName} · {renderStars(review.rating)}</Text>
                <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
              </View>
              <Text style={styles.commentText}>{review.comment}</Text>
              {currentUserId && String(review.reviewerId) === String(currentUserId) && (
                <View style={styles.reviewActions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => beginEditing(review)}
                    style={styles.editButton}
                  >
                    <Text style={styles.editButtonText}>Edit review</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={deletingReviewId === review._id}
                    onPress={() => deleteReview(review)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>
                      {deletingReviewId === review._id ? 'Deleting…' : 'Delete review'}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function renderStars(value: number) {
  return '★'.repeat(Math.max(0, Math.min(5, value))) + '☆'.repeat(Math.max(0, 5 - value));
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f7f6' },
  content: { padding: 22, paddingBottom: 32, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 },
  back: { width: 38, height: 38, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e8f4f0' },
  backText: { color: '#17332c', fontSize: 30, lineHeight: 32, marginTop: -3 },
  headerCopy: { flex: 1 },
  title: { color: '#17201e', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#66736f', fontSize: 13, marginTop: 3 },
  summaryCard: { minHeight: 88, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 22, borderRadius: 17, backgroundColor: '#fff' },
  average: { color: '#000', fontSize: 42, fontWeight: '400' },
  stars: { color: '#f5ae2d', fontSize: 22, letterSpacing: 1 },
  basedOn: { color: '#66736f', fontSize: 13, marginTop: 2 },
  reviewCard: { padding: 16, borderRadius: 17, backgroundColor: '#fff', gap: 13 },
  cardTitle: { color: '#17201e', fontSize: 16, fontWeight: '800' },
  ratingPicker: { flexDirection: 'row', gap: 3 },
  pickStar: { color: '#f5ae2d', fontSize: 29 },
  commentInput: { height: 74, padding: 12, borderRadius: 13, color: '#17201e', backgroundColor: '#f2f6f4', textAlignVertical: 'top', fontSize: 13 },
  postButton: { height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#176b58' },
  postButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  cancelEdit: { color: '#66736f', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  disabled: { opacity: 0.6 },
  recentTitle: { color: '#17201e', fontSize: 16, fontWeight: '800', marginTop: 2 },
  commentCard: { padding: 15, borderRadius: 14, backgroundColor: '#fff', gap: 7 },
  commentHeader: { gap: 2 },
  reviewer: { color: '#17201e', fontSize: 13, fontWeight: '800' },
  date: { color: '#66736f', fontSize: 11 },
  commentText: { color: '#17201e', fontSize: 13, lineHeight: 19 },
  editButton: { alignSelf: 'flex-start', marginTop: 3 },
  editButtonText: { color: '#176b58', fontSize: 13, fontWeight: '800' },
  reviewActions: { flexDirection: 'row', gap: 18, marginTop: 3 },
  deleteButton: { alignSelf: 'flex-start' },
  deleteButtonText: { color: '#b42318', fontSize: 13, fontWeight: '800' },
  empty: { color: '#66736f', paddingVertical: 10 },
});
