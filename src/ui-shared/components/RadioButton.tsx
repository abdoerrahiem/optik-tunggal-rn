import React, { Component } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { wrapper } from '../../lib/styles';
export default class RadioButton extends Component {
	state = {
		value: null,
	};
	render() {
		const { PROP } = this.props;
		const { value } = this.state;
		return (
			<View>
				{PROP.map(res => {
					return (
						<View key={res.key} style={[wrapper.row, 
												{marginBottom: 5, alignItems: 'center', 
												 borderColor: '#ccc', borderWidth: 1, borderRadius: 5,
												 width: 330, marginHorizontal: 5, padding: 10
												}]}>
							<TouchableOpacity
								style={styles.radioCircle}
								onPress={() => {
									this.setState({
										value: res.key,
									});
								}}>
                                  {value === res.key ? <View style={styles.selectedRb} /> : null}
							</TouchableOpacity>
							<Text style={styles.radioText}>{res.key}</Text>
						</View>
					);
				})}
                {/* <Text> Selected: {this.state.value} </Text> */}
			</View>
		);
	}
}
const styles = StyleSheet.create({
    radioText: {
        marginRight: 5,
        fontSize: 14,
        color: '#000',
		marginLeft: 10
    },
	radioCircle: {
		height: 20,
		width: 20,
		borderRadius: 100,
		borderWidth: 2,
		borderColor: '#0d674e',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 10
	},
	selectedRb: {
		width: 15,
		height: 15,
		borderRadius: 50,
		backgroundColor: '#0d674e',
    },
    result: {
        marginTop: 20,
        color: 'white',
        fontWeight: '600',
        backgroundColor: '#F3FBFE',
    },
});