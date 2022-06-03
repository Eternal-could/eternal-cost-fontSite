import React, { useRef, useState, useCallback, useEffect } from 'react';
import {Cell, Input, Button, Checkbox, Toast, Modal} from 'zarm';
import cx from 'classnames';
import Captcha from "react-captcha-code";
import CustomIcon from '@/components/CustomIcon';
import { post } from '@/utils'

import s from './style.module.less';

const Login = () => {
  const captchaRef = useRef();
  const [type, setType] = useState('login'); // 登录注册类型
  const [captcha, setCaptcha] = useState(''); // 验证码变化后存储值
  const [username, setUsername] = useState(''); // 账号
  const [password, setPassword] = useState(''); // 密码
  const [verify, setVerify] = useState(''); // 验证码
  const [checked, setChecked] = useState(false);

  //  验证码变化，回调方法
  const handleChange = useCallback((captcha) => {
    setCaptcha(captcha)
  }, []);
  
  const onSubmit = async () => {
    if (!username) {
      Toast.show('请输入账号')
      return
    }
    if (!password) {
      Toast.show('请输入密码')
      return
    }
    try {
      if (type == 'login') {
        const { data } = await post('/api/user/login', {
          username,
          password
        });
        console.log('data', data)
        localStorage.setItem('token', data.token);
        window.location.href = '/'
      } else {
        if (!verify) {
          Toast.show('请输入验证码')
          return
        };
        if (verify != captcha) {
          Toast.show('验证码错误')
          return
        };
        if (!checked) {
          Toast.show('请勾选我同意')
          return
        };
        const { data } = await post('/api/user/register', {
          username,
          password
        });
        Toast.show('注册成功');
         setType('login');
      }
    } catch (error) {
      Toast.show('系统错误');
    }
  };
  // 复选框
  const onChange = (e) => {
    if (!e.target.checked) {
      Modal.confirm({
        content: '是否要取消选择',
        cancelText: '不取消',
      }).then((res) => {
        res && setChecked(false);
      });
      return;
    }
    setChecked(true);
  };
  // 阅读并同意永E账单
  const readAgreement = () => {
    Toast.show({
      className: 'test',
      content: `本项目仅供学习使用。不对任何人因完全或部分使用本记账系统而作出或不作出的任何事情和后果承担任何责任!9s后自动关闭此遮罩层`,
      stayTime: 9000,
      mountContainer: document.getElementById('test-div'),
      mask: true,
    });
  }
  useEffect(() => {
    document.title = type == 'login' ? '登录' : '注册';
  }, [type])
  return <div className={s.auth}>
    <div className={s.head} />
    <div className={s.tab}>
      <span className={cx({ [s.avtive]: type == 'login' })} onClick={() => setType('login')}>登录</span>
      <span className={cx({ [s.avtive]: type == 'register' })} onClick={() => setType('register')}>注册</span>
    </div>
    <div className={s.form}>
      <Cell icon={<CustomIcon type="zhanghao" />}>
        <Input
          clearable
          type="text"
          placeholder="请输入账号"
          onChange={(value) => setUsername(value)}
        />
      </Cell>
      <Cell icon={<CustomIcon type="mima" />}>
        <Input
          clearable
          type="password"
          placeholder="请输入密码"
          onChange={(value) => setPassword(value)}
        />
      </Cell>
      {
        type == 'register' ? <Cell icon={<CustomIcon type="mima" />}>
          <Input
            clearable
            type="text"
            placeholder="请输入验证码"
            onChange={(value) => setVerify(value)}
          />
          <Captcha ref={captchaRef} charNum={4} onChange={handleChange} />
        </Cell> : null
      }
    </div>
    <div className={s.operation}>
      {
        type == 'register' ? <div className={s.agree}>
          <Checkbox onChange={onChange}
                    checked={checked}/>
          <label className="text-light">阅读并同意<a
              href="/#"
              onClick={(e) => {
                e.preventDefault();
                readAgreement();
              }}
          >《永E️账单》</a></label>
        </div> : null
      }
      <Button onClick={onSubmit} block theme="primary">{type == 'login' ? '登录' : '注册'}</Button>
    </div>
  </div>
};

export default Login;