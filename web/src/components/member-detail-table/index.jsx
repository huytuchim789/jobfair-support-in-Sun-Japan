import React from 'react'
import './styles.scss'
import { withRouter } from 'next/router'
import { url } from 'envalid'
import PropTypes from 'prop-types'
import { getMember } from '~/api/member-detail'

class MemberDetailTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      member: {
        id: 0,
        avatar: '',
        fullName: '',
        email: '',
        role: 0,
        phoneNumber: '',
        categories: [],
        chatworkID: '',
        assignedJF: [],
      },
      listCate: [],
      listJF: [],
    }
  }

  componentDidMount() {
    // const search = window.location.search
    // const params = new URLSearchParams(search)
    const id = parseInt(this.props.router.query.id, 10)
    getMember(id)
      .then((res) => {
        const member = res.data
        this.setState(
          {
            member: {
              id: member.id,
              email: member.email,
              fullName: member.name,
              avatar: member.avatar,
              role: member.role,
              chatworkID: member.chatwork_id,
              phoneNumber: member.phone_number,
            },
          },
          () => {
            this.setID(id) // set ID and Role after setState
          },
        )

        const listJobfair = res.data.jobfairs
        this.setState({
          listJF: listJobfair.map((element) => (
            <tr className="assigned-jf border-none block mx-auto">
              <td className="border-none inline-block mr-2">{element.name}</td>
              <td className="border-none inline-block">{element.start_date}</td>
            </tr>
          )),
        })
        const categorires = res.data.categories
        this.setState({
          listCate: categorires.map((element) => (
            <tr className="category-name border-none block mx-auto">{element.category_name}</tr>
          )),
        })
      })
      .catch((error) => console.log(error))
  }

  setID(id) {
    this.props.setID(id)
  }

  render() {
    return (
      <div className="flex css_all">
        <img
          alt="イメージがない"
          src={url(`../${this.state.member.avatar}`)}
          style={{
            width: '150px',
            height: '150px',
            display: 'block',
            borderRadius: '50%',
            margin: '30px 0 auto 200px',
          }}
          id="avatar"
        />
        <table className="member_table">
          <tr>
            <th>フルネーム：</th>
            <td
              className="min-w-1/2 block  ml-auto mr-auto  py-3 text-left"
              style={{ minHeight: '10px', marginRight: '200px' }}
            >
              {this.state.member.fullName}
            </td>
          </tr>
          <tr>
            <th>メールアドレス：</th>
            <td
              className="min-w-1/2 block  ml-auto mr-auto  py-3 text-left"
              style={{ minHeight: '10px', marginRight: '200px' }}
            >
              {this.state.member.email}
            </td>
          </tr>
          <tr>
            <th>カテゴリー：</th>
            <td
              className="min-w-1/2 block  ml-auto mr-auto  py-3 text-left"
              style={{ minHeight: '10px', marginRight: '200px' }}
            >
              {this.state.listCate}
            </td>
          </tr>
          <tr className="ml-auto mr-auto  py-3  text-left">
            <th>アサインされたJF：</th>
            <td style={{ minWidth: '50%', minHeight: '10px', display: 'block' }}>
              {this.state.listJF}
            </td>
          </tr>
        </table>
      </div>
    )
  }
}
export default withRouter(MemberDetailTable)
MemberDetailTable.propTypes = {
  router: PropTypes.any,
  setID: PropTypes.func,
}
MemberDetailTable.defaultProps = {
  router: null,
  setID: null,
}
