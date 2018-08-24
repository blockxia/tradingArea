import intl from 'react-intl-universal';
import react, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux'
import {Button, Form, Layout, Input, Table, Popover, Select, Radio} from 'antd';
import './style.scss';
import loading from 'Components/Common/Loading';
import message from 'Components/Common/message';
import Modal from 'Components/Common/Modal'
import {Link} from 'react-router'
import Slider from 'Components/Common/SliderBar';
import * as actions from '../../../../actions/Settings/Destinationmanage/tradingArea';
import AreaTrading from '../../../../Components/Common/AreaTrading'


const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const {Content} = Layout;

class TradingArea extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      pn: 1,
      ps: 10,
      loading: true,
      selecteDrowKeys: [],
      selecteDrows: [],
      title: '新增',
      showArea: false,//新增商圈
    }
  }

  ComponentDidMount = () => {
    let clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
    $('.main-content').css('minHeight', clientHeight + 'px').css('maxHeight', clientHeight + 'px');
    $(window).resize(function () {
      let clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
      $('.main-content').css('minHeight', clientHeight + 'px').css('minHeight', clientHeight + 'px');
    });
    // this.props.getdesttype()
    let params = {pn: 1, ps: 10};
    params.status = 1;
    this.props.fetchTradings(params, () => {
      this.setState({loading: false})
    })
  }

  handleSearch = () => {
    let params = {pn: 1, ps: this.state.ps};
    this.props.form.validateFields((error, values) => {
      values.tradingAreaName ? params.tradingAreaName = values.tradingAreaName : null;
      values.id ? params.id = values.id : null;
      params.status = values.status;
      this.setState({loading: true, pn: 1}, () => {
        this.props.fetchTradings(params,
          () => {
            this.setState({loading: false, selecteDrows: [], selecteDrowKeys: []})
          })
      })
    })

  }
  onChangePage = (currentpage, pagesize) => {
    let params = {};
    params.pn = currentpage;
    params.ps = this.state.ps;
    this.props.form.validateFields((error, val) => {
      val.tradingAreaName ? params.tradingAreaName = val.tradingAreaName : null;
      val.id ? params.id = val.id : null;
      params.status = val.status;
      this.setState({loading: true}, () => {
        this.props.fetchTradings(params,
          () => {
            this.setState({loading: false, pn: currentpage, selecteDrows: [], selecteDrowKeys: []})
          })
      })
    })
  };

  handleCancel = () => {
    this.props.form.setFieldsValue({tradingAreaName: '', status: '1'});
    this.setState({loading: true, pn: 1}, () => {
      this.props.fetchTradings({
          pn: 1, ps: this.state.ps, status: '1'
        },
        () => {
          this.setState({loading: false, selecteDrows: [], selecteDrowKeys: []})
        })
    })
  }
  onStartOrStop = (status) => {
    if (this.state.selecteDrowKeys.length == 0) {
      message.error('请先勾选项目，然后再操作')
    } else {
      let num = ''
      this.state.selecteDrowKeys.forEach((item, index) => {
        if (index == 0) {
          num += item
        } else {
          num += ',' + item
        }
      })
      let params = {num, status};
      this.setState({loading: true}, () => {
        this.props.updateTradings(params,
          () => {
            let params = {};
            params.pn = this.state.pn;
            params.ps = this.state.ps;
            this.props.form.validateFields((error, val) => {
              let {tradingAreaName,id,status}=val
               params={
                tradingAreaName:tradingAreaName || '',
                id:id || '',
                status:status
              }
              this.props.fetchTradings(params,
                () => {
                  this.setState({loading: false, selecteDrows: [], selecteDrowKeys: []})
                })
            })
          },
          () => {
            this.setState({loading: false})
          }
        )
      })
    }
  }
  oprateControl = (text, record, index) => {
    return (
      <div>
        <link className='first' onClick={() => {
          this.setState({id: record.id, item: record, showArea: true, title: '修改商圈'})
        }}>
          <span>编辑</span>
        </link>
      </div>
    )
  }
  // 表头
  _renderTableColumns = () => {
    return [
      {
        title: '商圈id',
        key: 'id',
        dataIndex: 'id',
        className: 'first-column-15',
        width: "10%",
        render: (text, row, index) => <span className="eslips-text-one" style={{webkitBoxOrient: 'vertical'}}>{text ?
          <popover placement="top" content={text} trigger="hover"
                   overlayclassName="comment-popover">{text}</popover> : '暂无'}</span>
      },
      {
        title: '商圈名称',
        key: 'tradingAreaName',
        dataIndex: 'tradingAreaName',
        width: '25%',
        render: (text, row, index) => <span className="eslips-text-one" style={{webkitBoxOrient: 'vertical'}}>{text ?
          <popover placement="top" content={text} trigger="hover"
                   overlayclassName="comment-popover">{text}</popover> : '暂无'}</span>
      },
      {
        title: '所属目的地',
        key: 'tradings',
        dataIndex: 'tradings',
        width: '35%',
        render: (text, record) => <span className="eslips-text-one" style={{webkitBoxOrient: 'vertical'}}>{record ?
          <popover placement="top" content={record} trigger="hover"
                   overlayclassName="comment-popover">{`${record.countryName}-${record.provinceName}-${record.cityName}`}</popover> : '暂无'}</span>
      },
      {
        title: '状态',
        key: 'status',
        width: '15%',
        dataIndex: 'status',
        render: (text, row, index) => text === 1 ? '启用' : '禁用'
      },
      {
        title: '操作',
        key: 'operation',
        width: '15%',
        dataIndex: 'operation',
        render: this.oprateControl
      }
    ]
  }
  handleUpdateArea(id, callback) {
    this.props.form.validateFields((err, val) => {
      if (err) {
        callback && callback();
        return;
      }
      let {tradingAreaName, status, cityName, cityId} = val;
      let params = {
        tradingAreaName: tradingAreaName,
        status: status,
        cityName: cityName,
        cityId: cityId,
      }
      this.props.updateTradings(id, params, () => {
        message.success('操作成功');
        callback && callback();
        this.setState({
          id: null,
          tradingAreaName:null,
          record: null,
          showArea: false,
        });

        setTimeout(x => this.props.fetchTradings(), 1000);
      }, () => {
        callback && callback();
        message.warn('操作失败');
      });
    })
  }
  //  启停数据
  start=(id,callback)=>{
    this.props.form.validateFields((err,val)=>{
      if(err){
        callback && callback()
        return
      }
      let {status}=val
      let params={
        status:status
      }
      //  启停接口(需在action中定义启停接口)
      this.props.startOrend(id,params,()=>{
        message.success('启停成功')
        callback && callback()
        this.setState({
          status:status
        });
        setTimeout(x => this.props.fetchTradings(), 1000);
      },()=>{
        callback && callback()
        message.warn('启停失败')
      })
    })
  }
  render() {
    const {getFieldDecorator} = this.props.form;
    // const {tradings} = this.props;
    let tradings = this.props.tradings && this.props.tradings.tradings;
    if (!tradings) {
      tradings = []
    }

    return (
      <div className="destination-page">
        <loading display={this.state.loading ? 'block' : 'none'}/>
        <div className='producttype-head'>
          <form className='form-wrap'>

            <FormItem label="商圈名称：" className='formitem'>
              {getFieldDecorator('tradingAreaName', {
                rules: [{required: false}],
              })(
                <input placeholder={'请输入目的地名称进行查询'} maxLength={10} style={{width: '180px'}}/>
              )}
            </FormItem>
            <FormItem label='状态：' className='formitem'>
              {getFieldDecorator('status', {
                initialValue: '1'
              })(
                <Select
                  style={{width: '100px'}}

                >
                  <Select.Option value="1" key="1">启用</Select.Option>
                  <Select.Option value="2" key="2">禁用</Select.Option>
                </Select>
              )}
            </FormItem>
            <FormItem className='formitem'>
              <button style={{marginRight: '20px'}} className="clear"
                      onClick={this.handleCancel}>{intl.get('lv.button.value.empty')}</button>
              <button type='primary' onClick={this.handleSearch}>{intl.get('lv.button.value.search')}</button>
            </FormItem>
          </form>
        </div>
        <div>
          <div style={{display: 'flex', marginBottom: 10}}>
            <div className='add-area' onClick={() => {
              this.setState({showArea: true, title: '新增商圈'})
            }}>
              新增
            </div>
            {getFieldDecorator('status', {
              initialValue: '1'
            })(
              <Select
                style={{width: '100px'}}
              >
                <Select.Option value="1" key="1">批量操作</Select.Option>
                <Select.Option value="2" key="2"  onClick={() => {this.onStartOrStop(1)}} >批量启用</Select.Option>
                <Select.Option value="3" key="3" onClick={() => {this.onStartOrStop(2)}} >批量禁用</Select.Option>
              </Select>
            )}
            {
              <div className='add' onClick={this.start}>确定</div>
            }
          </div>
          <Table
            rowkey="id"
            dataSource={tradings}
            columns={this._renderTableColumns()}
            rowSelection={{
              selecteDrowKeys: this.state.selecteDrowKeys,
              onChange: (selecteDrowKeys, selecteDrows) => {
                this.setState({selecteDrowKeys, selecteDrows})
              }
            }
            }

            //onchange={this.handletablechange}
            locale={
              {
                emptyText: intl.get("lv.common.nodata")
              }
            }
            pagination={{
              showQuickJumper: true,
              showTotal: (total, range) => `共${total}条数据`,
              current: this.state.pn,
              total: tradings.total,
              pagesize: this.state.ps,
              onchange: this.onChangePage
            }}
          />
        </div>
        {
          this.state.showArea && <modal
            visible={this.state.showArea}
            title={this.state.id ? "修改商圈" : '新增商圈'}
            onOk={this.handleUpdateArea.bind(this, this.state.id || '')}
            onCancel={x => this.setState({showArea: false, tradingAreaName: null, id: null, record: null})}
          >
            <div className="invoice-update-body">
              <form>
                <div className="row">
                  <span className='row-title required'>{`中文名称：`}</span>
                  <FormItem className="type">
                    {
                      getFieldDecorator('tradingAreaName', {
                          initialValue: this.state.record ? this.state.record.tradingAreaName : '',
                          rules: [{required: true, message: '请填写中文名称'}]
                        }
                      )(
                        <Input style={{width: 280}}/>
                      )
                    }
                  </FormItem>
                </div>
                <div className="row">
                  <span className="row-title required">{`地理框架：`}</span>
                  <AreaTrading
                    formMessageCallback={(formMessage) => {
                      this.setState({...formMessage})
                    }}
                    clear={this.state.clear}
                    clearCallback={() => {
                      this.setState({
                        clear: false
                      })
                    }}
                    isSelectShow={{country: true, province: true, city: true, county: false}}
                    noAllOption={true}
                  />
                </div>
                <div className="row">
                  <span className="row-title required rowright">{`状态：`}</span>
                  {
                    getFieldDecorator('status', {
                      initialValue: this.state.record ? this.state.record.status : '',
                      defaultValue: this.props.record.status,
                      rules: [{required: false}]
                    })(<radiogroup style={{lineHeight: 3.5, marginLeft: 20}}>
                        <radio value={1}>{`启用`}</radio>
                        <radio value={2}>{`禁用`}</radio>
                      </radiogroup>
                    )
                  }
                </div>
              </form>
            </div>
          </modal>
        }
      </div>

    )
  }
}

function mapStateToprops(state) {
  return {
    ...state.tradingsInfo,
  };
}

function mapDispatchToprops(dispatch) {
  return bindActionCreators({...Actions}, dispatch);
}
export default connect(
  mapStateToprops,
  mapDispatchToprops
)(Form.create()(TradingArea))





