import { randomUUID } from "node:crypto";
import { query } from "./db.js";

export async function enqueue(queueName, payload, maxAttempts = 3) {
  const result = await query(
    "insert into job_queue(queue_name,payload,max_attempts) values($1,$2,$3) returning id",
    [queueName, payload, maxAttempts],
  );
  return result.rows[0].id;
}

export async function claim(queueName, workerId = randomUUID()) {
  const result = await query(`
    with candidate as (
      select id from job_queue
      where queue_name=$1 and status in ('pending','failed')
        and available_at <= now() and attempts < max_attempts
      order by created_at
      for update skip locked limit 1
    )
    update job_queue j
      set status='processing', attempts=j.attempts+1, locked_at=now(), locked_by=$2
    from candidate where j.id=candidate.id
    returning j.*`, [queueName, workerId]);
  return result.rows[0] || null;
}

export async function complete(id, workerId) {
  const result = await query(
    "update job_queue set status='done',completed_at=now(),locked_at=null,locked_by=null where id=$1 and status='processing' and locked_by=$2 returning id",
    [id, workerId],
  );
  return result.rowCount === 1;
}

export async function fail(id, workerId, error) {
  const result = await query(`
    update job_queue set status=case when attempts >= max_attempts then 'dead' else 'failed' end,
      last_error=$3, locked_at=null, locked_by=null,
      available_at=now() + make_interval(secs => least(300, power(2, attempts)::int))
    where id=$1 and status='processing' and locked_by=$2 returning status`, [id, workerId, String(error).slice(0, 1000)]);
  return result.rows[0]?.status || null;
}