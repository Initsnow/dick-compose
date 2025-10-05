import json
from typing import Optional
import litellm
from litellm.files.main import ModelResponse
from litellm import Choices, Message
import os
from pydantic import BaseModel, ValidationError
from pytauri import Commands
from .models import Plan, Track, Instrument
from .prompt import PROMPT_PLAN, PROMPT_TRACK_GENERATOR


commands: Commands = Commands()


class ApiKey(BaseModel):
    key: str


# todo)) more models
@commands.command()
async def validate_api_key(body: ApiKey) -> bool:
    try:
        api_key = body.key
        response =litellm.utils.check_valid_key(model="deepseek/deepseek-chat", api_key=api_key)
        if response:
            os.environ["DEEPSEEK_API_KEY"] = api_key
            return True
        return False
    except Exception as e:
        print(f"API Key validation failed: {e}")
        return False


@commands.command()
async def set_api_key(body: ApiKey) -> bool:
    os.environ["DEEPSEEK_API_KEY"] = body.key
    return True


class PlanPrompt(BaseModel):
    content: str
    plan: Optional[Plan] = None
    tracks: Optional[list[Track]] = None


@commands.command()
async def generate_plan(body: PlanPrompt) -> Plan:
    # ensure result_str is always defined so exception handlers can reference it
    result_str = ""
    if body.plan is not None:
        if body.tracks is not None:
            prompt = str(PROMPT_PLAN(body.plan, body.tracks))
        else:
            prompt = str(PROMPT_PLAN(body.plan))
    else:
        prompt = str(PROMPT_PLAN())
    print("generate_plan, body.tracks:", body.tracks)

    try:
        response = await litellm.acompletion(
            model="deepseek/deepseek-chat",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": body.content},
            ],
            temperature=0.6,
            response_format={"type": "json_object"},
        )
        if isinstance(response, ModelResponse):
            if isinstance(response.choices, list) and response.choices:
                first_choice = response.choices[0]
                if (
                    isinstance(first_choice, Choices)
                    and isinstance(first_choice.message, Message)
                    and isinstance(first_choice.message.content, str)
                ):
                    result_str = first_choice.message.content

        if result_str.startswith("```json"):
            result_str = result_str.strip("```json\n").strip("```")

        # 1. 将字符串解析为 Python 字典
        data = json.loads(result_str)

        validated_data = Plan.model_validate(data)

        return validated_data

    except json.JSONDecodeError as e:
        raise json.JSONDecodeError(
            f"Failed to parse JSON for '{body.content}': {e}. Raw response: '{result_str[:150]}...'",
            result_str,
            e.pos,
        )
    except ValidationError as e:
        raise ValidationError(
            f"JSON structure validation failed for '{body.content}': {e}"
        )
    except Exception as e:
        raise Exception(f"An unexpected error occurred for '{body.content}': {e}")


class T_DATA(BaseModel):
    plan: Plan
    existingTracks: list[Track]
    instrumentToGenerate: Instrument


@commands.command()
async def generate_track(body: T_DATA) -> Track:
    # ensure result_str is always defined so exception handlers can reference it
    result_str = ""
    try:
        response = await litellm.acompletion(
            model="deepseek/deepseek-chat",
            messages=[
                {
                    "role": "system",
                    "content": str(
                        PROMPT_TRACK_GENERATOR(
                            body.plan,
                            body.existingTracks,
                            f"为{body.instrumentToGenerate}生成 Track",
                        )
                    ),
                },
            ],
            temperature=0.6,
            response_format={"type": "json_object"},
        )
        if isinstance(response, ModelResponse):
            if isinstance(response.choices, list) and response.choices:
                first_choice = response.choices[0]
                if (
                    isinstance(first_choice, Choices)
                    and isinstance(first_choice.message, Message)
                    and isinstance(first_choice.message.content, str)
                ):
                    result_str = first_choice.message.content

        if result_str.startswith("```json"):
            result_str = result_str.strip("```json\n").strip("```")

        # 1. 将字符串解析为 Python 字典
        data = json.loads(result_str)

        validated_data = Track.model_validate(data)
        print(validated_data)
        return validated_data

    except json.JSONDecodeError as e:
        raise json.JSONDecodeError(
            f"Failed to parse JSON for '{body.instrumentToGenerate.instrumentName}': {e}. Raw response: '{result_str[:150]}...'",
            result_str,
            e.pos,
        )
    except ValidationError as e:
        raise ValidationError(
            f"JSON structure validation failed for '{body.instrumentToGenerate.instrumentName}': {e}"
        )
    except Exception as e:
        raise Exception(
            f"An unexpected error occurred for '{body.instrumentToGenerate.instrumentName}': {e}"
        )
