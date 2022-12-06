import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors, shadows, wrapper } from '../../lib/styles';
import { ReviewModel } from '../../types/model';
import { RatingStars, Typography } from '../../ui-shared/components';

type Props = ViewProps & {
  review: ReviewModel;
};

function ReviewItem({
  review,
  style,
  ...props
}: Props) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.user}>
        <Typography size="md" style={{ flex: 1 }}>{review.nama || review.name}</Typography>

        <RatingStars
          size={18}
          value={review.star || review.rating}
          icons={['star', 'star-outline']}
        />
      </View>

      <Typography style={{ paddingBottom: 15 }}>
        {review.remark || review.content}
      </Typography>

      {!review.replies?.length ? null : (
        <View style={{ paddingBottom: 15 }}>
          {review.replies.map((item, index) => (
            <View key={index} style={styles.reply}>
              <Typography heading size="sm" color="primary">
                {item.nama || item.name}
              </Typography>

              <Typography style={styles.replyContent}>
                {item.remark || item.content}
              </Typography>
            </View>
          ))}
        </View>
      )}

      <View style={{ position: 'relative', marginHorizontal: -20 }}>
        <Svg height="8" width="100%">
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="black" stopOpacity="0.2" />
              <Stop offset="1" stopColor="white" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect fill="url(#grad)" x="0" y="0" width="100%" height="100%" />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
  },

  user: {
    ...wrapper.row,
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 8,
  },
  reply: {

  },
  replyContent: {
    marginLeft: 40,
    paddingLeft: 12,
    paddingHorizontal: 4,
    borderLeftWidth: 2,
    borderColor: colors.palettes.primary,
  },
});

export default ReviewItem;
