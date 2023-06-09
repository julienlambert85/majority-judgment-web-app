import {useTranslation} from 'next-i18next';
import {Container, Row, Col} from 'reactstrap';
import {ElectionTypes, useElection} from '@services/ElectionContext';
import {DndContext} from '@dnd-kit/core';
import {arrayMove, SortableContext} from '@dnd-kit/sortable';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPen} from '@fortawesome/free-solid-svg-icons';
import CandidateField from './CandidateField';

const CandidatesConfirmField = () => {
  const {t} = useTranslation();
  const [election, dispatch] = useElection();

  const handleDragEnd = (event) => {
    /**
     * Update the list of grades after dragging an item
     */
    const {active, over} = event;

    if (over && over.id && active.id && active.id !== over.id) {
      const newCandidates = arrayMove(
        election.candidates,
        active.id - 1,
        over.id - 1
      );

      dispatch({
        type: ElectionTypes.SET,
        field: 'candidates',
        value: newCandidates,
      });
    }
  };

  const sortIds = election.candidates.map((_, i) => i + 1);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={sortIds}>
        <Container className="bg-white p-4 mt-3 mt-md-0">
          <Row>
            <Col className="col-auto me-auto">
              <h5 className="text-dark">{t('admin.confirm-candidates')}</h5>
            </Col>
          </Row>
          {election.candidates.map((_, i) => (
            <CandidateField
              position={i}
              key={i}
              className="text-primary m-0"
            />
          ))}
        </Container>
      </SortableContext>
    </DndContext>
  );
};

export default CandidatesConfirmField;
