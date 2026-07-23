import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Text,
} from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  title?: string;
  titleStyle?: TextStyle;
  padding?: number;
  elevation?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  title,
  titleStyle,
  padding = 16,
  elevation = 2,
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          padding,
          elevation,
        },
        style,
      ]}
    >
      {title && (
        <Text
          style={[
            styles.title,
            titleStyle,
          ]}
        >
          {title}
        </Text>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000000',
  },
});

export default Card;
