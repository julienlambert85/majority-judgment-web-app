import {useState, useEffect, useRef, KeyboardEvent, MouseEventHandler} from 'react';
import {useTranslation} from 'next-i18next';
import {Container} from 'reactstrap';
import {faArrowRight} from '@fortawesome/free-solid-svg-icons';
import {MAX_NUM_CANDIDATES} from '@services/constants';
import Alert from '@components/Alert';
import Button from '@components/Button';
import {ElectionTypes, useElection} from '@services/ElectionContext';
import CandidateField from './CandidateField';
import {AppTypes, useAppContext} from '@services/context';

const CandidatesField = ({onSubmit}) => {
  const {t} = useTranslation();
  const submitReference = useRef(null);

  const [_, dispatchApp] = useAppContext();

  const [election, dispatch] = useElection();
  const candidates = election.candidates;
  const [error, setError] = useState(null);
  const disabled = candidates.filter((c) => c.name !== '').length < 2;

  // What to do when we change the candidates
  useEffect(() => {
    // Initialize the list with at least two candidates
    if (candidates.length < 2) {
      dispatch({type: ElectionTypes.CANDIDATE_PUSH, value: 'default'});
    }
    if (candidates.length > MAX_NUM_CANDIDATES) {
      setError('error.too-many-candidates');
    }
  }, [candidates]);



  useEffect(() => {
    if (!disabled && submitReference.current) {
      submitReference.current.focus();
    }
  }, [disabled, submitReference]);


  const handleSubmit = (e) => {
    if (disabled) {
      console.log("FOO");
      dispatchApp({
        type: AppTypes.TOAST_ADD,
        status: "error",
        message: t("error.at-least-2-candidates")
      })
    } else {
      return onSubmit(e)
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key == "Enter" && !disabled) {
      onSubmit();
    }
  }

  return (
    <Container className="candidate flex-grow-1 my-5 flex-column d-flex justify-content-between">
      <div className="d-flex flex-column">
        <h4 className="mb-4">{t('admin.add-candidates')}</h4>
        <Alert msg={error} />
        <div className="d-flex flex-column mx-2 mx-md-0">
          {candidates.map((candidate, index) => {
            return (
              <CandidateField
                key={index}
                position={index}
                className="px-4 my-3"
              />
            );
          })}
        </div>
      </div>

      <Container
        className="my-5 d-md-flex d-grid justify-content-md-center"
      >
        <div onClick={handleSubmit}
        >
          <Button
            outline={true}
            color="secondary"
            className={`bg-blue${disabled ? " disabled" : ""}`}
            ref={submitReference}
            icon={faArrowRight}
            position="right"
            onKeyPress={handleKeyPress}
          >
            {t('admin.candidates-submit')}
          </Button>
        </div>
      </Container>
    </Container>
  );
};

export default CandidatesField;
