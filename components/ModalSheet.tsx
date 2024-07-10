import useTheme from '@/hooks/useTheme';
import { px } from '@/utlis/size';
import React, { FC, PropsWithChildren, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';


type THeight = Record<'height', number>;
interface ModalSheetProps extends PropsWithChildren {
  open?: boolean;
  onClose?: () => void;
  style?: StyleProp<ViewStyle & THeight>;
}

const DEFAULT_HEIGHT = 400;
const OFFSET_HEIGHT = 70;
const VELOCTIY_HEIGHT = 2000;
const ANIMATION_DURATION = 400;


const ModalSheet: FC<ModalSheetProps> = (props) => {
  const { open, onClose, children } = props;
  const { theme: { colors } } = useTheme();

  const HEIGHT = (props.style as THeight)?.height ?? DEFAULT_HEIGHT;
  const translateY = useSharedValue(HEIGHT);
  const [show, setShow] = useState(open);

  const gestureHandler = useMemo(() =>
    Gesture
      .Pan()
      .onChange(e => {
        if (e.translationY >= 0 && e.translationY <= OFFSET_HEIGHT) {
          translateY.value = e.translationY;
        }
      })
      .onEnd(e => {
        if (e.velocityY > VELOCTIY_HEIGHT && onClose) {
          translateY.value = withTiming(HEIGHT, { duration: ANIMATION_DURATION }, (finished) => {
            if (finished) {
              runOnJS(onClose)();
              runOnJS(setShow)(false);
            };
          });
        } else {
          translateY.value = withTiming(0);
        }
      }), []);

  const uas = useAnimatedStyle(() => ({
    height: HEIGHT,
    transform: [
      { translateY: translateY.value + OFFSET_HEIGHT }
    ]
  }), []);

  const onRequestClose = useCallback(() => {
    translateY.value = withTiming(HEIGHT, { duration: ANIMATION_DURATION }, (finished) => {
      if (finished && onClose) {
        runOnJS(onClose)();
        runOnJS(setShow)(false);
      };
    });
  }, []);

  useEffect(() => {
    if (open && translateY.value === HEIGHT) {
      setShow(true);
      translateY.value = withTiming(0);
    } else if (!open) {
      translateY.value = withTiming(HEIGHT, { duration: ANIMATION_DURATION }, (finished) => {
        if (finished && onClose) {
          runOnJS(onClose)();
          runOnJS(setShow)(false);
        };
      });
    }
  }, [open]);


  return (
    <Modal
      transparent

      statusBarTranslucent
      visible={show}
      onRequestClose={onRequestClose}
      animationType={'none'}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onRequestClose}
          style={styles.clickAwayListener}
        />
        <GestureDetector gesture={gestureHandler}>
          <Animated.View
            style={[
              styles.content,
              {
                backgroundColor: colors.elevation.level1,
                shadowColor: colors.shadow,
              },
              props.style,
              uas
            ]}
          >
            <View style={[styles.minus, { backgroundColor: colors.surfaceDisabled }]} />
            {children}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  )
}


const styles = StyleSheet.create({
  clickAwayListener: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  content: {
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    borderTopLeftRadius: px(20),
    borderTopRightRadius: px(20),
    paddingTop: px(10),
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 3,
  },
  minus: {
    height: 3,
    width: 40,
    borderRadius: 3,
    alignSelf: 'center',
  }
});

export default memo(ModalSheet);