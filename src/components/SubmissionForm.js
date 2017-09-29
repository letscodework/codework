import firebase from 'firebase/app';
import marked from 'marked';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import StyledForm from './StyledForm';
import StyledMessage from './StyledMessage';
import { StyledToggleButtons, StyledToggleButton } from './StyledButton';

const StyledTextArea = styled.textarea`
  border: none;
  border-radius: 0 4px 4px;
  box-shadow: 0 1px 3px rgba(50, 50, 93, 0.15), 0 1px 0 rgba(0, 0, 0, 0.02);
  display: block;
  font-family: monospace, monospace; /* stylelint-disable-line font-family-no-duplicate-names */
  font-size: 0.9rem;
  line-height: 1.3;
  min-height: 8rem;
  outline: none;
  padding: 1rem;
  width: 100%;

  &.active {
    box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
  }
`;

const StyledFormFooter = styled.div`
  align-items: flex-end;
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;

  a {
    color: #fff;
    font-size: 0.9rem;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const StyledWhiteButton = styled.button`
  background: #fff;
  border: none;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
  color: #00bcd4;
  cursor: pointer;
  display: block;
  font-size: 15px;
  letter-spacing: 0.025em;
  padding: 0.5rem 0.625rem;
  text-decoration: none;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
`;

const StyledSubmissionPreview = styled.div`
  background: #fff;
  border-radius: 0 4px 4px;
  box-shadow: 0 1px 3px rgba(50, 50, 93, 0.15), 0 1px 0 rgba(0, 0, 0, 0.02);
  display: block;
  font-size: 0.9rem;
  line-height: 1.3;
  min-height: 8rem;
  padding: 1rem;
  width: 100%;
`;

export default class SubmissionForm extends React.Component {
  state = {
    solution: '',
    mode: 'write',
  };

  saveSubmission = () => {
    const { user, submissionsRef } = this.props;
    submissionsRef.push({
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      solution: this.state.solution,
      author: user.uid,
    });
    this.setState({
      solution: '',
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();

    const { user, signIn } = this.props;
    if (user) {
      this.saveSubmission();
    } else {
      signIn(this.saveSubmission);
    }
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  handleFocus = (event) => {
    event.target.classList.add('active');
  }

  handleBlur = (event) => {
    event.target.classList.remove('active');
  }

  toggleView = (event) => {
    event.preventDefault();
    this.setState({
      mode: event.target.dataset.mode,
    });
  }

  renderSolution() {
    if (this.state.mode === 'write') {
      return (
        <StyledTextArea
          name="solution"
          placeholder="Add your solution"
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
          onChange={this.handleChange}
          value={this.state.solution}
        />
      );
    }

    return (
      <StyledSubmissionPreview
        dangerouslySetInnerHTML={{
          __html: marked(this.state.solution),
        }}
      />
    );
  }

  renderContent() {
    if (this.props.user) {
      return (
        <div>
          <StyledToggleButtons>
            <li>
              <StyledToggleButton
                type="button"
                className={this.state.mode === 'write' ? 'active' : null}
                data-mode="write"
                onClick={this.toggleView}
              >
              Write
              </StyledToggleButton>
            </li>
            <li>
              <StyledToggleButton
                type="button"
                className={this.state.mode === 'preview' ? 'active' : null}
                data-mode="preview"
                onClick={this.toggleView}
              >
                Preview
              </StyledToggleButton>
            </li>
          </StyledToggleButtons>

          {this.renderSolution()}

          <StyledFormFooter>
            <a
              href="https://guides.github.com/features/mastering-markdown/"
              target="_blank"
              rel="noopener noreferrer"
            >
              You can write your solution in Markdown!
            </a>
            <StyledWhiteButton type="submit">Submit</StyledWhiteButton>
          </StyledFormFooter>
        </div>
      );
    }

    if (this.props.user === null) {
      return <StyledMessage>Sign in to submit a solution!</StyledMessage>;
    }

    return null;
  }

  render() {
    return (
      <StyledForm onSubmit={this.handleSubmit}>
        {this.renderContent()}
      </StyledForm>
    );
  }
}

SubmissionForm.propTypes = {
  user: PropTypes.shape({
    uid: PropTypes.string.isRequired,
  }),
  signIn: PropTypes.func.isRequired,
  submissionsRef: PropTypes.object,
};

SubmissionForm.defaultProps = {
  user: null,
  submissionsRef: {},
};
