import React, { createRef, memo, useCallback, useRef, useState } from 'react'
import { TextInput as RNTextInput, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { TextInput } from 'react-native-paper';

type Props = {
  value?: string;
  disabled?: boolean;
  error?: boolean;
  style?: StyleProp<ViewStyle>;
  onChange?: (value: string) => void;
}

const INPUT_SIZE = Array(5)
  .fill(1)
  .map((_, i) => i);


const OtpInput = memo<Props>(function OtpInput(props) {

  const [error, setError] = useState(props.error);

  const values = useRef<string[]>(INPUT_SIZE.map(() => ''));
  const [inputs] = useState(() => {
    return INPUT_SIZE.map(() => createRef<RNTextInput>())
  });

  const onChange = useCallback((text: string, index: number) => {
    if (text.length === 1) {
      inputs[index + 1]?.current?.focus();
    } else {
      inputs[index - 1]?.current?.focus();
    }
    values.current[index] = text;
    if (values.current.every(text => text !== '')) {
      setError(false)
    }
    props.onChange?.(values.current.join(''));
  }, [inputs, error]);

  return (
    <View style={[styles.container, props.style]}>
      {INPUT_SIZE.map(index => (
        <View
          key={index}
          style={{ width: '18%' }}
        >
          <TextInput
            ref={inputs[index]}
            mode={'outlined'}
            textAlign={'center'}
            editable={!props.disabled}
            maxLength={1}
            keyboardType={'numeric'}
            autoFocus={index === 0}
            onChangeText={(text) => onChange(text, index)}
            error={props.error ? values.current[index] === '' : false}
            onKeyPress={e => {
              if (e.nativeEvent.key !== 'Backspace') return;
              inputs[index - 1]?.current?.focus();
            }}
          />
        </View>
      ))}
    </View>
  )
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});


export default OtpInput