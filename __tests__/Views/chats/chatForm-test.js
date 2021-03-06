import '../../../__Mocks__';
import React from 'react';
import { shallow } from 'enzyme';
import ChatForm from '../../../src/views/home/ChatForm';
import mock from '../../../__Mocks__/dataMock';

const sendChatMock = jest.fn();
const mockOpenModal = jest.fn();
const sendMessageWithSongMock = jest.fn();

const screenProps = {
  t: (data) => data
};

const mockNavigation = {
  state: {
    params: {
      uid: 'broadcast'
    }
  }
};

describe('chat form component', () => {
  const wrapper = shallow(
    <ChatForm
      user={mock.mockUser}
      navigation={mockNavigation.state}
      setChat={sendChatMock}
      previousChat={[]}
      openFileModal={mockOpenModal}
      sendMessagesWithSound={sendMessageWithSongMock}
      screenProps={screenProps}
    />
  );

  test('render all component', () => {
    expect(wrapper.instance()).toBeDefined();
  });

  test('componentDidMount', async () => {
    const instance = wrapper.instance();
    await instance.componentDidMount();
    expect(instance.state.hasPermission).toBe(true);
  });

  test('audio button', () => {
    wrapper.find('Draggable').props().onPressIn();
    expect(wrapper.instance().state.recording).toBe(true);
  });

  test('audio button', () => {
    wrapper.find('Draggable').props().onPressOut();
    expect(wrapper.instance().state.recording).toBe(false);
  });

  test('simulate onchageText', () => {
    const input = wrapper.find('Component').first();
    input.props().onChangeText('test');

    expect(wrapper.instance().state.message).toBe('test');
  });

  test('send message', async () => {
    await wrapper.find('ForwardRef').at(1).props().onPress();
    setTimeout(async () => {
      await expect(sendChatMock.mock.calls.length).toBe(1);
    }, 1000);
  });
});
